import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

import { selectCurrentUser } from '../features/users/usersSlice'

const UserAccount = () => {
    const user = useSelector(selectCurrentUser)
    const location = useLocation()

    if(!user){
        return (
          <Navigate
            to="/auth?mode=login"
            replace
            state={{ from: location.pathname }}
          />
        )
    }
    return (
    <div>
        <div>
            <h4>{user.name}</h4>
        </div>
        <div>
            <div>
                Email: <span>{user.email}</span>
            </div>
        </div>
    </div>
  )
}

export default UserAccount
