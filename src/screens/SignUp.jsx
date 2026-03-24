import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import ascendLogo from '../assets/ascend-logo.png'

const ARCHETYPE_LABELS = {
  eagle: 'Eagle — Strategic & Decisive',
  fox:   'Fox — Resourceful & Adaptive',
  bear:  'Bear — Steady & Dependable',
}

export default function SignUp() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { signup } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // If no location state, redirect back to onboarding
  const state = location.state
  if (!state || !state.name) {
    return <Navigate to="/" replace />
  }

  const { name, archetype, humorStyle } = state

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // 1. Create Firebase Auth account
      const { user } = await signup(email, password)

      // 2. Write user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        archetype,
        humorStyle,
        tier: 'free',
        createdAt: serverTimestamp(),
      })

      // 3. Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.code === 'auth/email-already-in-use'
          ? 'An account with that email already exists.'
          : err.code === 'auth/weak-password'
          ? 'Password must be at least 6 characters.'
          : err.code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : err.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'var(--bg-elevated)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img
            src={ascendLogo}
            alt="Ascend"
            style={{ height: '48px', objectFit: 'contain' }}
          />
        </div>

        {/* Welcome heading */}
        <h1
          style={{
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          Welcome, {name}! 🎉
        </h1>

        {/* Archetype badge */}
        {archetype && ARCHETYPE_LABELS[archetype] && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '1.75rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '0.35rem 0.9rem',
                background: 'rgba(79, 142, 247, 0.12)',
                border: '1px solid rgba(79, 142, 247, 0.3)',
                borderRadius: '999px',
                color: 'var(--accent-blue)',
                fontSize: '0.8rem',
                fontWeight: '500',
              }}
            >
              {ARCHETYPE_LABELS[archetype]}
            </span>
          </div>
        )}

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            textAlign: 'center',
            marginBottom: '1.75rem',
          }}
        >
          Create your account to save your progress
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: 'rgba(248, 113, 113, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--danger)',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading ? 'rgba(79, 142, 247, 0.5)' : 'var(--accent-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, opacity 0.2s',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading && (
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }}
              />
            )}
            {loading ? 'Creating account…' : 'Create My Account'}
          </button>
        </form>

        {/* Link to login for existing users */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-blue)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: 0,
            }}
          >
            Sign in →
          </button>
        </p>
      </div>
    </div>
  )
}
