import { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { toast } from "sonner";

export interface LiveBookingNotification {
  id: string;
  ref: string;
  name: string;
  guests: number;
  date: string;
  time: string;
  receivedAt: Date;
}

export function useSSEBookings() {
  const { token, isAuthenticated } = useAdminAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<LiveBookingNotification[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const invalidateAdminData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
  }, [queryClient]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsConnected(false);
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const connectSSE = async () => {
      try {
        const response = await fetch("/api/admin/bookings/stream", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          setIsConnected(false);
          return;
        }

        setIsConnected(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const chunk of parts) {
            const lines = chunk.split("\n");
            let event = "message";
            let dataStr = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                event = line.replace("event: ", "").trim();
              } else if (line.startsWith("data: ")) {
                dataStr = line.replace("data: ", "").trim();
              }
            }

            if (event === "connected") {
              setIsConnected(true);
            } else if (event === "NEW_BOOKING") {
              try {
                const booking = JSON.parse(dataStr);
                const notification: LiveBookingNotification = {
                  id: booking._id || String(Date.now()),
                  ref: booking.ref,
                  name: booking.name,
                  guests: booking.guests,
                  date: booking.date,
                  time: booking.time,
                  receivedAt: new Date(),
                };

                setNotifications((prev) => [notification, ...prev.slice(0, 19)]);

                // Pop a high-visibility real-time toast alert
                toast.success(`🎉 New Table Reservation: ${booking.name}`, {
                  description: `${booking.guests} guests on ${booking.date} at ${booking.time} (Ref: ${booking.ref})`,
                  duration: 8000,
                  action: {
                    label: "View",
                    onClick: () => {
                      window.location.hash = "";
                    },
                  },
                });

                // Immediately refresh table queries
                invalidateAdminData();
              } catch (e) {
                console.error("SSE parse error", e);
              }
            } else if (event === "BOOKING_UPDATED" || event === "BOOKING_DELETED") {
              invalidateAdminData();
            }
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          setIsConnected(false);
          // Auto-reconnect after 4s backoff
          setTimeout(() => {
            if (!abortController.signal.aborted) {
              connectSSE();
            }
          }, 4000);
        }
      }
    };

    connectSSE();

    return () => {
      abortController.abort();
      setIsConnected(false);
    };
  }, [isAuthenticated, token, invalidateAdminData]);

  return {
    isConnected,
    notifications,
    clearNotifications,
  };
}
