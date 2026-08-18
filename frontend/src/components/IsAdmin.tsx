import { type ReactNode } from 'react'
import { useSelector } from 'react-redux'

import type { RootState } from '../app/store'
import { selectCurrentUser } from '../features/users/usersSlice'

interface IsAdminProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function IsAdmin({ children, fallback = null }: IsAdminProps) {
  const currentUser = useSelector((state: RootState) => selectCurrentUser(state))
  const isAdmin = currentUser?.role === 'admin'

  return <>{isAdmin ? children : fallback}</>
}
