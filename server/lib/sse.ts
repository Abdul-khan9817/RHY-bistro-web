import type { Response } from "express";

interface SseClient {
  id: string;
  res: Response;
}

class SseRegistry {
  private clients: Map<string, SseClient> = new Map();

  addClient(id: string, res: Response): void {
    this.clients.set(id, { id, res });
  }

  removeClient(id: string): void {
    this.clients.delete(id);
  }

  broadcast(event: string, data: unknown): void {
    const payload = JSON.stringify(data);
    this.clients.forEach(({ res }) => {
      try {
        res.write(`event: ${event}\ndata: ${payload}\n\n`);
      } catch {
        // Client disconnected mid-write — will be cleaned up on 'close'
      }
    });
  }

  count(): number {
    return this.clients.size;
  }
}

// Singleton shared across all routes
export const sseRegistry = new SseRegistry();
