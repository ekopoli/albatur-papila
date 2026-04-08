import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, push, remove, update, get } from 'firebase/database'

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

// Custom codes — Firebase'de saklanır, tüm kullanıcılar görebilir
// Yapı: customCodes / sinif / { id: { kod, sinif, createdAt } }
export const customCodesRef = () => ref(db, 'customCodes')
export const customCodesSinifRef = (sinif) => ref(db, `customCodes/${sinif.replace(/[.#$[\]]/g, '_')}`)

export const listenCustomCodes = (callback) => {
  return onValue(customCodesRef(), (snap) => {
    const raw = snap.val() || {}
    const parsed = {}
    for (const [sinifKey, entries] of Object.entries(raw)) {
      const sinif = Object.values(entries)[0]?.sinif || sinifKey
      parsed[sinif] = Object.values(entries).map(e => e.kod)
    }
    callback(parsed, raw)
  })
}

// Custom siniflar
export const customSiniflarRef = () => ref(db, 'customSiniflar')

export const listenCustomSiniflar = (callback) => {
  return onValue(customSiniflarRef(), (snap) => {
    const data = snap.val() || {}
    callback(Object.values(data).map(e => e.sinif))
  })
}

export const addCustomSinif = (sinif) => {
  const newRef = push(customSiniflarRef())
  return set(newRef, { sinif, createdAt: Date.now() })
}

export const deleteCustomSinif = async (sinif) => {
  const snap = await get(customSiniflarRef())
  const data = snap.val() || {}
  const entry = Object.entries(data).find(([, v]) => v.sinif === sinif)
  if (entry) return remove(ref(db, `customSiniflar/${entry[0]}`))
}

// Custom kategoriler
export const customKategorilerRef = () => ref(db, 'customKategoriler')

export const listenCustomKategoriler = (callback) => {
  return onValue(customKategorilerRef(), (snap) => {
    const data = snap.val() || {}
    callback(Object.values(data).map(e => e.kategori))
  })
}

export const addCustomKategori = (kategori) => {
  const newRef = push(customKategorilerRef())
  return set(newRef, { kategori, createdAt: Date.now() })
}

export const deleteCustomKategori = async (kategori) => {
  const snap = await get(customKategorilerRef())
  const data = snap.val() || {}
  const entry = Object.entries(data).find(([, v]) => v.kategori === kategori)
  if (entry) return remove(ref(db, `customKategoriler/${entry[0]}`))
}

export const addCustomCode = (sinif, kod) => {
  const sinifKey = sinif.replace(/[.#$[\]]/g, '_')
  const newRef = push(ref(db, `customCodes/${sinifKey}`))
  return set(newRef, { kod, sinif, createdAt: Date.now() })
}

export const deleteCustomCode = (sinif, kod, allEntries) => {
  // allEntries: Firebase'den gelen ham veri { firebaseKey: { kod, sinif } }
  const sinifKey = sinif.replace(/[.#$[\]]/g, '_')
  const entry = Object.entries(allEntries).find(([, v]) => v.kod === kod)
  if (entry) return remove(ref(db, `customCodes/${sinifKey}/${entry[0]}`))
}

// ─── Kullanıcılar — Firebase'de saklanır ─────────────────────────────────────
export const usersRef = () => ref(db, 'users')
export const userRef = (id) => ref(db, `users/${id}`)

export const listenUsers = (callback) => {
  return onValue(usersRef(), (snap) => {
    const data = snap.val() || {}
    callback(Object.entries(data).map(([id, v]) => ({ ...v, id })))
  })
}

export const saveUserToDB = (user) => set(userRef(user.id), user)
export const updateUserInDB = (id, changes) => update(userRef(id), changes)
export const deleteUserFromDB = (id) => remove(userRef(id))

// İlk kurulum: varsayılan kullanıcıları Firebase'e yaz (sadece bir kez)
const DEFAULT_USERS = [
  { id: 'u1', username: 'papila', password: 'Smtppl5862', role: 'super', displayName: 'Papila', mustChangePassword: false },
  { id: 'u2', username: 'kbt', password: 'kbt123', role: 'super', displayName: 'KBT', mustChangePassword: true },
  { id: 'u3', username: 'admin', password: 'admin123', role: 'limited', displayName: 'Admin', mustChangePassword: true },
  { id: 'u4', username: 'kullanici', password: 'pass123', role: 'limited', displayName: 'Kullanıcı', mustChangePassword: true },
  { id: 'u5', username: 'misafir', password: 'misafir', role: 'guest', displayName: 'Misafir', mustChangePassword: false },
]

export const initUsersIfEmpty = async () => {
  const snap = await get(usersRef())
  if (!snap.exists()) {
    for (const u of DEFAULT_USERS) {
      await saveUserToDB(u)
    }
  }
}

// Eski localStorage fonksiyonları — artık kullanılmıyor ama import hatası olmasin
export const getUsers = () => DEFAULT_USERS
export const saveUsers = () => {}
