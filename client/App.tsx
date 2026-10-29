import React, { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster as RadixToaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import './i18n';

import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

// Public Components & Core Layout
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Home from './pages/Home';

// Lazy-loaded Public Pages for Fast Initial Page Load
const About = lazy(() => import('./pages/About'));
const Menu = lazy(() => import('./pages/Menu'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Reservation = lazy(() => import('./pages/Reservation'));
const Contact = lazy(() => import('./pages/Contact'));
const Hours = lazy(() => import('./pages/Hours'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Impressum = lazy(() => import('./pages/legal/Impressum'));

// Lazy-loaded Admin Layout & Pages (prevents heavy libraries like recharts from bundling into initial load)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Bookings = lazy(() => import('./pages/admin/Bookings'));
const Tables = lazy(() => import('./pages/admin/Tables'));
const MenuManager = lazy(() => import('./pages/admin/MenuManager'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Settings = lazy(() => import('./pages/admin/Settings'));

const queryClient = new QueryClient();

// Customer layout with Bistro Navbar & Footer
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-[#0f2419]">
    <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Admin Authentication */}
        <Route path="/admin/login" component={AdminLogin} />

        {/* Protected Admin Console Routes */}
        <Route path="/admin">
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/admin/bookings">
          <ProtectedRoute>
            <AdminLayout>
              <Bookings />
            </AdminLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/admin/tables">
          <ProtectedRoute>
            <AdminLayout>
              <Tables />
            </AdminLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/admin/menu">
          <ProtectedRoute>
            <AdminLayout>
              <MenuManager />
            </AdminLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/admin/gallery">
          <ProtectedRoute>
            <AdminLayout>
              <GalleryManager />
            </AdminLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/admin/customers">
          <ProtectedRoute>
            <AdminLayout>
              <Customers />
            </AdminLayout>
          </ProtectedRoute>
        </Route>

        <Route path="/admin/settings">
          <ProtectedRoute>
            <AdminLayout>
              <Settings />
            </AdminLayout>
          </ProtectedRoute>
        </Route>

        {/* Public Restaurant Website */}
        <Route path="/">
          <PublicLayout>
            <Home />
          </PublicLayout>
        </Route>
        <Route path="/about">
          <PublicLayout>
            <About />
          </PublicLayout>
        </Route>
        <Route path="/menu">
          <PublicLayout>
            <Menu />
          </PublicLayout>
        </Route>
        <Route path="/gallery">
          <PublicLayout>
            <Gallery />
          </PublicLayout>
        </Route>
        <Route path="/reservation">
          <PublicLayout>
            <Reservation />
          </PublicLayout>
        </Route>
        <Route path="/contact">
          <PublicLayout>
            <Contact />
          </PublicLayout>
        </Route>
        <Route path="/hours">
          <PublicLayout>
            <Hours />
          </PublicLayout>
        </Route>
        <Route path="/legal/privacy">
          <PublicLayout>
            <Privacy />
          </PublicLayout>
        </Route>
        <Route path="/legal/terms">
          <PublicLayout>
            <Terms />
          </PublicLayout>
        </Route>
        <Route path="/legal/impressum">
          <PublicLayout>
            <Impressum />
          </PublicLayout>
        </Route>

        {/* 404 Fallback */}
        <Route>
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <RadixToaster />
          <SonnerToaster position="top-right" richColors />
        </TooltipProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
