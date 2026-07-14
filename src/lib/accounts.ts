export interface SavedAccount {
  id: string
  email: string
  username: string
  avatar_url: string
  roblox_id?: string
}

const STORAGE_KEY = 'yobest_saved_accounts'
const ACTIVE_KEY = 'yobest_active_account'

export function getSavedAccounts(): SavedAccount[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

export function saveAccount(account: SavedAccount) {
  const accounts = getSavedAccounts()
  const existing = accounts.findIndex(a => a.id === account.id)
  if (existing >= 0) accounts[existing] = account
  else accounts.push(account)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export function removeAccount(id: string) {
  const accounts = getSavedAccounts().filter(a => a.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export function setActiveAccount(id: string) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function getActiveAccountId(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}
