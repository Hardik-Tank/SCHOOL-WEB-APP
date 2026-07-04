import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authApi from '../api/auth.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'schoolerp_token'
const USER_KEY = 'schoolerp_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const existingToken = sessionStorage.getItem(TOKEN_KEY)
    if (!existingToken) {
      setLoading(false)
      return
    }
    authApi
      .getMe()
      .then((res) => {
        const profile = res.data.data
        setUser(profile)
        sessionStorage.setItem(USER_KEY, JSON.stringify(profile))
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(USER_KEY)
        setUser(null)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password)
    const { token: newToken, user: newUser } = res.data.data
    sessionStorage.setItem(TOKEN_KEY, newToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
