import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import {
  Bell,
  Check,
  CreditCard,
  Gift,
  LockKeyhole,
  Mail,
  MapPin,
  PackageCheck,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import type { FormEvent } from 'react'
import type { AppDispatch } from '../app/store'

import {
  selectCurrentUser,
  selectProfileUpdateError,
  selectProfileUpdateStatus,
  updateCurrentUser,
} from '../features/users/usersSlice'

const UserAccount = () => {
    const dispatch = useDispatch<AppDispatch>()
    const user = useSelector(selectCurrentUser)
    const updateStatus = useSelector(selectProfileUpdateStatus)
    const updateError = useSelector(selectProfileUpdateError)
    const location = useLocation()
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')

    if(!user){
        return (
          <Navigate
            to="/auth?mode=login"
            replace
            state={{ from: location.pathname }}
          />
        )
    }

    const initials = user.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U'
    const points = user.points ?? user.balance ?? 0
    const memberId = user.id ? String(user.id).slice(-8).toUpperCase() : 'MEMBER'

    const handleEdit = () => {
      setName(user.name || '')
      setEmail(user.email || '')
      setIsEditing(true)
    }

    const handleCancel = () => {
      setName(user.name || '')
      setEmail(user.email || '')
      setIsEditing(false)
    }

    const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      try {
        await dispatch(updateCurrentUser({ name, email })).unwrap()
        setIsEditing(false)
      } catch {
        // The rejected thunk exposes the server message through Redux.
      }
    }

    return (
      <div className="account-page">
        <div className="shop-shell">
          <header className="account-hero">
            <div>
              <p className="section-kicker">Member space / Settings</p>
              <h1 className="account-title">Your account.</h1>
              <p className="account-intro">
                A clear view of your profile, shopping preferences, and account essentials.
              </p>
            </div>
            <div className="account-status"><span aria-hidden="true" /> Account active</div>
          </header>

          <div className="account-layout">
            <aside className="member-panel" aria-label="Membership overview">
              <div className="member-card">
                <div className="member-card-top">
                  <span className="member-label">ShopBy member</span>
                  <Gift aria-hidden="true" />
                </div>
                <div className="member-avatar" aria-hidden="true">{initials}</div>
                <div>
                  <p className="member-name">{user.name}</p>
                  <p className="member-email">{user.email}</p>
                </div>
                <div className="member-card-foot">
                  <div><span>Member ID</span><strong>{memberId}</strong></div>
                  <div><span>Points</span><strong>{points}</strong></div>
                </div>
              </div>

              <div className="account-note">
                <ShieldCheck aria-hidden="true" />
                <div>
                  <strong>Your details stay private</strong>
                  <p>Personal account information is only used to support your ShopBy experience.</p>
                </div>
              </div>
            </aside>

            <div className="settings-stack">
              <section className="settings-card" aria-labelledby="profile-settings-title">
                <div className="settings-card-head">
                  <span className="settings-icon"><UserRound aria-hidden="true" /></span>
                  <div>
                    <p className="settings-index">01 / Identity</p>
                    <h2 id="profile-settings-title">Profile details</h2>
                  </div>
                  {isEditing ? (
                    <span className="settings-state is-editing">Editing</span>
                  ) : (
                    <button type="button" className="account-edit-button" onClick={handleEdit}>Edit profile</button>
                  )}
                </div>
                <form className="account-profile-form" onSubmit={handleProfileSubmit}>
                <div className="account-fields">
                  <label className="account-field">
                    <span>Full name</span>
                    <input
                      type="text"
                      value={isEditing ? name : user.name || ''}
                      onChange={(event) => setName(event.target.value)}
                      readOnly={!isEditing}
                      required
                      maxLength={80}
                    />
                  </label>
                  <label className="account-field">
                    <span>Email address</span>
                    <span className="account-input-wrap">
                      <Mail aria-hidden="true" />
                      <input
                        type="email"
                        value={isEditing ? email : user.email || ''}
                        onChange={(event) => setEmail(event.target.value)}
                        readOnly={!isEditing}
                        required
                      />
                    </span>
                  </label>
                </div>
                {updateError && isEditing && <p className="account-update-error" role="alert">{updateError}</p>}
                {updateStatus === 'succeeded' && !isEditing && (
                  <p className="account-update-success" role="status"><Check aria-hidden="true" /> Profile updated</p>
                )}
                {isEditing && (
                  <div className="account-form-actions">
                    <button type="button" className="account-cancel-button" onClick={handleCancel} disabled={updateStatus === 'loading'}>Cancel</button>
                    <button type="submit" className="primary-button account-save-button" disabled={updateStatus === 'loading'}>
                      {updateStatus === 'loading' ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                )}
                </form>
              </section>

              <section className="settings-card" aria-labelledby="shopping-settings-title">
                <div className="settings-card-head">
                  <span className="settings-icon"><PackageCheck aria-hidden="true" /></span>
                  <div>
                    <p className="settings-index">02 / Shopping</p>
                    <h2 id="shopping-settings-title">Shopping preferences</h2>
                  </div>
                </div>
                <div className="settings-rows">
                  <div className="settings-row">
                    <span className="settings-row-icon"><MapPin aria-hidden="true" /></span>
                    <div><strong>Delivery address</strong><p>Add an address for a faster checkout.</p></div>
                    <span className="settings-value is-muted">Not added</span>
                  </div>
                  <div className="settings-row">
                    <span className="settings-row-icon"><CreditCard aria-hidden="true" /></span>
                    <div><strong>Payment method</strong><p>Your preferred payment option.</p></div>
                    <span className="settings-value is-muted">Not added</span>
                  </div>
                </div>
              </section>

              <section className="settings-card" aria-labelledby="communication-settings-title">
                <div className="settings-card-head">
                  <span className="settings-icon"><Bell aria-hidden="true" /></span>
                  <div>
                    <p className="settings-index">03 / Preferences</p>
                    <h2 id="communication-settings-title">Communication</h2>
                  </div>
                </div>
                <div className="settings-rows">
                  <div className="settings-row">
                    <span className="settings-row-icon"><Mail aria-hidden="true" /></span>
                    <div><strong>Order updates</strong><p>Receipts, delivery status, and important account messages.</p></div>
                    <span className="settings-value is-on"><span aria-hidden="true" /> On</span>
                  </div>
                  <div className="settings-row">
                    <span className="settings-row-icon"><Gift aria-hidden="true" /></span>
                    <div><strong>Offers and rewards</strong><p>Member-only offers and points updates.</p></div>
                    <span className="settings-value is-muted">Optional</span>
                  </div>
                </div>
              </section>

              <section className="settings-card settings-card-dark" aria-labelledby="security-settings-title">
                <div className="settings-card-head">
                  <span className="settings-icon"><LockKeyhole aria-hidden="true" /></span>
                  <div>
                    <p className="settings-index">04 / Protection</p>
                    <h2 id="security-settings-title">Security</h2>
                  </div>
                  <span className="settings-state"><ShieldCheck aria-hidden="true" /> Protected</span>
                </div>
                <p className="security-copy">
                  Your password protects access to saved account details and personal shopping information.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
  )
}

export default UserAccount
