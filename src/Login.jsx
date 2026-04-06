import React, { useState } from 'react'
import { LOGO } from './constants.js'

export default function Login({ users, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const attempt = () => {
    const u = users.find(u => u.username === username && u.password === password)
    u ? onLogin(u) : setErr('Kullanıcı adı veya şifre hatalı.')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace" }}>
      <div style={{ width: 310 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={LOGO} alt="ALBATUR" style={{ height: 40, objectFit: 'contain', display: 'block', margin: '0 auto 14px' }} />
        </div>
        <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 8, padding: 22 }}>
          <div style={{ marginBottom: 13 }}>
            <label className="flbl">Kullanıcı Adı</label>
            <input className="inp" value={username} onChange={e => { setUsername(e.target.value); setErr('') }} placeholder="kullanıcı adı" autoFocus />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="flbl">Şifre</label>
            <input className="inp" type="password" value={password} onChange={e => { setPassword(e.target.value); setErr('') }} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && attempt()} />
          </div>
          {err && <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 14, padding: '8px 10px', background: 'rgba(239,68,68,.07)', borderRadius: 4, border: '1px solid rgba(239,68,68,.2)' }}>{err}</div>}
          <button className="btn bA" style={{ width: '100%', justifyContent: 'center', padding: '9px 0' }} onClick={attempt}>Giriş Yap</button>
        </div>
      </div>
    </div>
  )
}
