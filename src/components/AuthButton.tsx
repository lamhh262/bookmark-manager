"use client"

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function AuthButton() {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign in',
        variant: 'destructive',
      })
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: 'Success',
        description: 'Signed out successfully',
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      })
    }
  }

  return (
    <Button onClick={user ? handleSignOut : handleSignIn} variant="outline">
      {user ? 'Sign Out' : 'Sign In'}
    </Button>
  )
}
