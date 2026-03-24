import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(79, 142, 247, 0.2)',
            borderTopColor: 'var(--accent-blue)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}
