// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import AccountSettings from '@views/account-settings'

const AccountTab = dynamic(() => import('@views/account-settings/account'))
const SecurityTab = dynamic(() => import('@views/account-settings/security'))
const BillingPlansTab = dynamic(() => import('@views/account-settings/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/account-settings/notifications'))
const ConnectionsTab = dynamic(() => import('@views/account-settings/connections'))

// Vars
const tabContentList = () => ({
  account: <AccountTab />,
  security: <SecurityTab />,
  'billing-plans': <BillingPlansTab />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

const AccountSettingsPage = () => {
  return <AccountSettings tabContentList={tabContentList()} />
}

export default AccountSettingsPage
