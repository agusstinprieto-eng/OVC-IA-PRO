import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user,           setUser]           = useState(null)
  const [profile,        setProfile]        = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const fetchingRef = useRef(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false); setProfileLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(id) {
    if (fetchingRef.current) return
    fetchingRef.current = true
    setProfileLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (error) console.warn('[useAuth] profile fetch:', error.message)
    setProfile(data ?? null)
    setLoading(false)
    setProfileLoading(false)
    fetchingRef.current = false
  }

  const signOut = () => supabase.auth.signOut()

  return {
    user,
    profile,
    loading: loading || profileLoading,
    signOut,
    isAdmin: profile?.role === 'admin',
  }
}
