import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageSpinner } from '@/components/ui/Spinner'

export function AuthGuard({ children, requiredRole = null }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <PageSpinner />
  if (!user)   return <Navigate to="/auth/login" replace />

  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
