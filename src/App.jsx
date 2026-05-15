import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUiStore } from '@/store/uiStore'
import { PageSpinner } from '@/components/ui/Spinner'
import { AuthGuard } from '@/components/auth/AuthGuard'

// ── Public ──────────────────────────────────────────────────────
const Home             = lazy(() => import('@/pages/Home'))
const Events           = lazy(() => import('@/pages/Events'))
const EventDetail      = lazy(() => import('@/pages/EventDetail'))
const MyTickets        = lazy(() => import('@/pages/MyTickets'))
const Checkout         = lazy(() => import('@/pages/Checkout'))
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation'))

// ── Auth ────────────────────────────────────────────────────────
const Login          = lazy(() => import('@/pages/Auth/Login'))
const Register       = lazy(() => import('@/pages/Auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/Auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('@/pages/Auth/ResetPassword'))
const Callback       = lazy(() => import('@/pages/Auth/Callback'))

// ── Admin ───────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'))
const AdminEvents    = lazy(() => import('@/pages/Admin/EventManager'))
const AdminEventForm = lazy(() => import('@/pages/Admin/EventForm'))
const AdminOrders    = lazy(() => import('@/pages/Admin/OrderList'))
const AdminScanner   = lazy(() => import('@/pages/Admin/TicketScanner'))

export default function App() {
  const initTheme = useUiStore((s) => s.initTheme)
  useEffect(() => { initTheme() }, [initTheme])

  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>

        {/* ── Public ──────────────────────────────── */}
        <Route path="/"              element={<Home />} />
        <Route path="/eventos"       element={<Events />} />
        <Route path="/eventos/:slug" element={<EventDetail />} />
        <Route path="/mis-boletos"   element={<MyTickets />} />
        <Route path="/checkout"      element={<Checkout />} />
        <Route path="/checkout/confirmacion/:orderId" element={<OrderConfirmation />} />

        {/* ── Auth ────────────────────────────────── */}
        <Route path="/auth/login"           element={<Login />} />
        <Route path="/auth/registro"        element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password"  element={<ResetPassword />} />
        <Route path="/auth/callback"        element={<Callback />} />
        <Route path="/login"    element={<Navigate to="/auth/login"    replace />} />
        <Route path="/registro" element={<Navigate to="/auth/registro" replace />} />

        {/* ── Admin ───────────────────────────────── */}
        <Route path="/admin" element={
          <AuthGuard requiredRole="admin"><AdminDashboard /></AuthGuard>
        } />
        <Route path="/admin/eventos" element={
          <AuthGuard requiredRole="admin"><AdminEvents /></AuthGuard>
        } />
        <Route path="/admin/eventos/nuevo" element={
          <AuthGuard requiredRole="admin"><AdminEventForm /></AuthGuard>
        } />
        <Route path="/admin/eventos/:id" element={
          <AuthGuard requiredRole="admin"><AdminEventForm /></AuthGuard>
        } />
        <Route path="/admin/ordenes" element={
          <AuthGuard requiredRole="admin"><AdminOrders /></AuthGuard>
        } />
        <Route path="/admin/escaner" element={
          <AuthGuard requiredRole="scanner"><AdminScanner /></AuthGuard>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
