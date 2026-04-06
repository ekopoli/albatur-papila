import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAmQNMfgQBIUWY5uz5Qgo31DKtXjG5ZlX4",
  authDomain: "albatur-papila.firebaseapp.com",
  databaseURL: "https://albatur-papila-default-rtdb.firebaseio.com",
  projectId: "albatur-papila",
  storageBucket: "albatur-papila.firebasestorage.app",
  messagingSenderId: "196832308692",
  appId: "1:196832308692:web:5b45fef254f5149974fa41"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)

// Jobs
export const jobsRef = () => ref(db, 'jobs')
export const jobRef = (id) => ref(db, `jobs/${id}`)

export const listenJobs = (callback) => {
  return onValue(jobsRef(), (snap) => {
    const data = snap.val()
    if (!data) { callback([]); return }
    const arr = Object.entries(data).map(([id, v]) => ({ ...v, id }))
    arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    callback(arr)
  })
}

export const addJob = (job) => {
  const newRef = push(jobsRef())
  return set(newRef, { ...job, id: newRef.key, createdAt: Date.now() })
}

export const updateJob = (id, changes) => update(jobRef(id), changes)
export const deleteJob = (id) => remove(jobRef(id))

// Users — localStorage'da kalır (şifre güvenliği için)
const LOCAL_KEY = 'alb_users_v2'
const DEFAULT_USERS = [
  { id: '1', username: 'papila', password: 'Smtppl5862', role: 'super', displayName: 'Papila' },
  { id: '2', username: 'kbt', password: 'kbt123', role: 'accview', displayName: 'KBT' },
  { id: '3', username: 'admin', password: 'admin123', role: 'limited', displayName: 'Admin' },
  { id: '4', username: 'kullanici', password: 'pass123', role: 'limited', displayName: 'Kullanıcı' },
  { id: '5', username: 'misafir', password: 'misafir', role: 'guest', displayName: 'Misafir' },
]

export const getUsers = () => {
  try {
    const d = localStorage.getItem(LOCAL_KEY)
    return d ? JSON.parse(d) : DEFAULT_USERS
  } catch { return DEFAULT_USERS }
}

export const saveUsers = (users) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(users)) } catch {}
}
