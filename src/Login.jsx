import React, { useState } from 'react'
import { LOGO } from './constants.js'
import { updateUserInDB } from './firebase.js'

export default function Login({ users, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [err, setErr] = useState('')
  const [changing, setChanging] = useState(null)
  const [newPw, setNewPw] = useState('')
  const [newPw2, setNewPw2] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [saving, setSaving] = useState(false)

  const attempt = () => {
    const u = users.find(u => u.username === username && u.password === password)
    if (!u) { setErr('Kullanıcı adı veya şifre hatalı.'); return }
    if (u.mustChangePassword) {
      setChanging(u)
    } else {
      onLogin(u, remember)
    }
  }

  const changePassword = async () => {
    if (newPw.length < 4) { setPwErr('Şifre en az 4 karakter olmalı.'); return }
    if (newPw !== newPw2) { setPwErr('Şifreler eşleşmiyor.'); return }
    setSaving(true)
    const updated = { ...changing, password: newPw, mustChangePassword: false }
    await updateUserInDB(changing.id, updated)
    setSaving(false)
    onLogin(updated, false)
  }

  if (changing) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace" }}>
      <div style={{ width: 320 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src={LOGO} alt="ALBATUR" style={{ height: 40, objectFit: 'contain', display: 'block', margin: '0 auto 10px' }} />
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#444', fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 500 }}>ALBATUR-PAPİLA İŞ TAKİP</div>
        </div>
        <div style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 8, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', marginBottom: 4, fontFamily: "'IBM Plex Sans',sans-serif" }}>Şifre Belirleme</div>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 20, fontFamily: "'IBM Plex Sans',sans-serif" }}>
            Merhaba <strong style={{ color: '#888' }}>{changing.displayName}</strong>, ilk girişinizde kendi şifrenizi belirlemeniz gerekiyor.
          </div>
          <div style={{ marginBottom: 13 }}>
            <label className="flbl">Yeni Şifre</label>
            <input className="inp" type="password" autoFocus value={newPw} onChange={e => { setNewPw(e.target.value); setPwErr('') }} placeholder="En az 4 karakter" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="flbl">Yeni Şifre (Tekrar)</label>
            <input className="inp" type="password" value={newPw2} onChange={e => { setNewPw2(e.target.value); setPwErr('') }} placeholder="Aynı şifreyi tekrar girin"
              onKeyDown={e => e.key === 'Enter' && changePassword()} />
          </div>
          {pwErr && <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 14, padding: '8px 10px', background: 'rgba(239,68,68,.07)', borderRadius: 4, border: '1px solid rgba(239,68,68,.2)' }}>{pwErr}</div>}
          <button className="btn bA" style={{ width: '100%', justifyContent: 'center', padding: '9px 0', opacity: saving ? .7 : 1 }}
            onClick={changePassword} disabled={saving}>
            {saving ? 'Kaydediliyor…' : 'Şifremi Kaydet ve Giriş Yap'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace" }}>
      <div style={{ width: 310 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={LOGO} alt="ALBATUR" style={{ height: 40, objectFit: 'contain', display: 'block', margin: '0 auto 10px' }} />
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#444', fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 500 }}>ALBATUR-PAPİLA İŞ TAKİP</div>
        </div>
        <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 8, padding: 22 }}>
          <div style={{ marginBottom: 13 }}>
            <label className="flbl">Kullanıcı Adı</label>
            <input className="inp" value={username} onChange={e => { setUsername(e.target.value); setErr('') }} placeholder="kullanıcı adı" autoFocus />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label className="flbl">Şifre</label>
            <input className="inp" type="password" value={password} onChange={e => { setPassword(e.target.value); setErr('') }} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && attempt()} />
          </div>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: '#f59e0b', width: 14, height: 14 }} />
            <label htmlFor="remember" style={{ fontSize: 11, color: '#888', cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}>Beni Hatırla</label>
          </div>
          {err && <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 14, padding: '8px 10px', background: 'rgba(239,68,68,.07)', borderRadius: 4, border: '1px solid rgba(239,68,68,.2)' }}>{err}</div>}
          <button className="btn bA" style={{ width: '100%', justifyContent: 'center', padding: '9px 0' }} onClick={attempt}>Giriş Yap</button>
        </div>
      </div>
    </div>
  )
}