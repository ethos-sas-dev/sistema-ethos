'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../_lib/auth/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
}

export default function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }

    if (!isLoading && user && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      )

      if (!hasAllPermissions) {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, router, requiredPermissions, hasPermission])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#008A4B]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
} 