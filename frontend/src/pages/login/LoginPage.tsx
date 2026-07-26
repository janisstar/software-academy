import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, user, loading } = useAuth()
  const [un, setUn] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDisabled =
    un.trim().length === 0 || pw.trim().length === 0 || isSubmitting

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (isDisabled) {
      return
    }

    try {
      setIsSubmitting(true)
      await login(un, pw)
      navigate('/home', { replace: true })
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.detail)
      } else {
        setError('Unexpected error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Ждём проверку сессии, иначе форма мигнёт перед редиректом.
  if (loading) {
    return <div>Loading...</div>
  }

  // Уже вошедшему пользователю форма входа не нужна.
  if (user) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Sign in</h1>

        <label className={styles.field}>
          <span>Username</span>
          <input value={un} onChange={(event) => setUn(event.target.value)} />
        </label>

        <label className={styles.field}>
          <span>Password</span>
          <input
            type="password"
            value={pw}
            onChange={(event) => setPw(event.target.value)}
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button className={styles.button} type="submit" disabled={isDisabled}>
          {isSubmitting ? 'Signing in...' : 'Log in'}
        </button>
      </form>
    </div>
  )
}
