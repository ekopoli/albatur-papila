import React, { useState } from 'react'
import { ROLLER } from './constants.js'
import { saveUserToDB, updateUserInDB, deleteUserFromDB } from './firebase.js'
import { RefThumb } from './components.jsx'

// ─── Revizyon Modal ────────────────────────────────────────────────────────────
// Görseli max 600px ve %70 kalitede sıkıştır
const gorselSikistir = (file) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 600
      let w = img.width, h = img.height
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
})

export function RevizyonModal({ job, onConfirm, onClose }) {
  const [not, setNot] = useState('')
  const [gorsel, setGorsel] = useState('')
  const [linkler, setLinkler] = useState(['', '', ''])

  const setLink = (i, v) => setLinkler(prev => prev.map((l, idx) => idx === i ? v : l))

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mbox" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c084fc', fontFamily: "'IBM Plex Sans',sans-serif" }}>↩ Revizyona Al</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{job.kodu || '—'} · {job.kategori || '—'}</div>
          </div>
          <button className="btn bG" style={{ fontSize: 16, padding: '3px 10px' }} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 22 }}>
          <label className="flbl">Revizyon Açıklaması</label>
          <textarea className="inp" rows={4} autoFocus placeholder="İstenilen revizyonları buraya yazın…" value={not} onChange={e => setNot(e.target.value)} style={{ resize: 'vertical', lineHeight: 1.6, marginBottom: 14 }} />

          {/* Referans */}
          <div style={{ paddingTop: 12, borderTop: '1px solid #141414', marginBottom: 14 }}>
            <div style={{ fontSize: 8, color: '#666', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Referans (İsteğe Bağlı)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <div>
                <label className="flbl">Referans Görseli</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} id="revRefGorsel"
                      onChange={async e => {
                        const file = e.target.files[0]
                        if (!file) return
                        const compressed = await gorselSikistir(file)
                        setGorsel(compressed)
                      }} />
                    <label htmlFor="revRefGorsel"
                      style={{ display: 'block', background: '#111', border: '1px dashed #2a2a2a', borderRadius: 4, padding: '8px 12px', cursor: 'pointer', fontSize: 11, color: '#555', textAlign: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#c084fc'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}>
                      {gorsel ? '📎 Görsel seçildi — değiştir' : '📎 Görsel seç'}
                    </label>
                  </div>
                  {gorsel && <RefThumb src={gorsel} onClear={() => setGorsel('')} />}
                </div>
              </div>
              <div>
                <label className="flbl">Referans Linkleri</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {linkler.map((l, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input className="inp" value={l} onChange={e => setLink(i, e.target.value)}
                        placeholder={`Link ${i + 1}...`} style={{ fontSize: 11, flex: 1 }} />
                      {l && (
                        <a href={l.startsWith('http') ? l : `https://${l}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ flexShrink: 0, padding: '6px 10px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, color: '#888', fontSize: 11, textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'all .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c084fc'; e.currentTarget.style.color = '#c084fc' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}>
                          ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 14, borderTop: '1px solid #111' }}>
            <button className="btn bO" onClick={onClose}>İptal</button>
            <button className="btn" style={{ background: 'rgba(192,132,252,.15)', color: '#c084fc', border: '1px solid rgba(192,132,252,.3)' }}
              onClick={() => onConfirm(not, gorsel, linkler)}>↩ Revizyona Gönder</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Kullanıcı Yönetimi ────────────────────────────────────────────────────────
const uid = () => 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2)
const EMPTY_U = { username: '', password: '', displayName: '', role: 'limited', mustChangePassword: true }

export function UsersPanel({ users, session }) {
  const [editing, setEditing] = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY_U)
  const [showPw, setShowPw] = useState({})
  const [saving, setSaving] = useState(false)
  const isSuper = session?.role === 'super'

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const openEdit = (u) => { setForm({ username: u.username, password: u.password, displayName: u.displayName, role: u.role, mustChangePassword: u.mustChangePassword ?? false }); setEditing(u) }
  const openNew = () => { setForm(EMPTY_U); setEditing('new') }
  const closeEdit = () => { setEditing(null); setSaving(false) }

  const save = async () => {
    if (!form.displayName || !form.username || !form.password) { alert('Tüm alanları doldurun.'); return }
    setSaving(true)
    if (editing === 'new') {
      const newUser = { ...form, id: uid() }
      await saveUserToDB(newUser)
    } else {
      await updateUserInDB(editing.id, { ...editing, ...form })
    }
    closeEdit()
  }

  const del = async (id) => {
    await deleteUserFromDB(id)
    setDelConfirm(null)
  }

  const roles = [{ v: 'super', l: 'Tam Yetkili' }, { v: 'accview', l: 'Muhasebe Görüntüleyici' }, { v: 'limited', l: 'Sınırlı Admin' }, { v: 'guest', l: 'Misafir' }]

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', fontFamily: "'IBM Plex Sans',sans-serif", marginBottom: 3 }}>Kullanıcı Yönetimi</div>
          <div style={{ fontSize: 10, color: '#3a3a3a', fontFamily: "'IBM Plex Sans',sans-serif" }}>Kullanıcılar Firebase'de saklanır — tüm cihazlardan erişilebilir.</div>
        </div>
        <button className="btn bA" onClick={openNew}>+ Kullanıcı Ekle</button>
      </div>
      <div style={{ background: '#0b0b0b', border: '1px solid #141414', borderRadius: 6, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th><th>Kullanıcı Adı</th><th>Şifre</th><th>Yetki</th><th>Durum</th>
              <th style={{ textAlign: 'right', paddingRight: 16, width: 160 }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ color: '#c0c0c0' }}>
                <td style={{ fontSize: 12 }}>{u.displayName}</td>
                <td style={{ fontSize: 11, color: '#666' }}>{u.username}</td>
                <td style={{ fontSize: 12 }}>
                  {isSuper
                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: showPw[u.id] ? '#888' : '#252525', letterSpacing: showPw[u.id] ? 0 : 3 }}>
                          {showPw[u.id] ? u.password : '●'.repeat(Math.min((u.password||'').length, 8))}
                        </span>
                        <button onClick={() => setShowPw(p => ({ ...p, [u.id]: !p[u.id] }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 4px', fontSize: 11, color: '#333', borderRadius: 3 }}
                          onMouseEnter={e => e.currentTarget.style.color = '#888'}
                          onMouseLeave={e => e.currentTarget.style.color = '#333'}>
                          {showPw[u.id] ? '○' : '◉'}
                        </button>
                      </div>
                    : <span style={{ color: '#252525', letterSpacing: 3 }}>{'●'.repeat(Math.min((u.password||'').length, 8))}</span>}
                </td>
                <td><span className={`badge b${(u.role||'g')[0]}`}>{ROLLER[u.role] || u.role}</span></td>
                <td>
                  {u.mustChangePassword
                    ? <span style={{ fontSize: 9, color: '#f59e0b', letterSpacing: '0.08em' }}>⚠ Şifre bekleniyor</span>
                    : <span style={{ fontSize: 9, color: '#333', letterSpacing: '0.08em' }}>✓ Aktif</span>}
                </td>
                <td style={{ textAlign: 'right', paddingRight: 12 }}>
                  {delConfirm === u.id
                    ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: '#555' }}>Silinsin mi?</span>
                        <button className="btn" style={{ background: '#7f1d1d', color: '#fca5a5', fontSize: 10, padding: '3px 10px' }} onClick={() => del(u.id)}>Evet</button>
                        <button className="btn bO" style={{ fontSize: 10, padding: '3px 10px' }} onClick={() => setDelConfirm(null)}>Hayır</button>
                      </div>
                    : <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="btn bG" style={{ fontSize: 10, padding: '3px 10px' }} onClick={() => openEdit(u)}>✏ Düzenle</button>
                        <button className="btn bR" style={{ fontSize: 10, padding: '3px 10px' }} onClick={() => setDelConfirm(u.id)}>Sil</button>
                      </div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeEdit()}>
          <div className="mbox" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="mhd">
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', fontFamily: "'IBM Plex Sans',sans-serif" }}>{editing === 'new' ? 'Yeni Kullanıcı' : `Düzenle — ${editing.displayName}`}</div>
                <div style={{ fontSize: 9, color: '#444', marginTop: 2 }}>
                  {editing === 'new' ? 'Kullanıcı ilk girişte kendi şifresini belirleyecek' : ''}
                </div>
              </div>
              <button className="btn bG" style={{ fontSize: 16, padding: '3px 10px' }} onClick={closeEdit}>✕</button>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 14 }}>
                <div><label className="flbl">Ad Soyad</label><input className="inp" value={form.displayName} onChange={e => setF('displayName', e.target.value)} autoFocus /></div>
                <div><label className="flbl">Kullanıcı Adı</label><input className="inp" value={form.username} onChange={e => setF('username', e.target.value)} /></div>
                <div>
                  <label className="flbl">Geçici Şifre</label>
                  <input className="inp" value={form.password} onChange={e => setF('password', e.target.value)} placeholder="İlk giriş şifresi" />
                </div>
                <div>
                  <label className="flbl">Yetki Seviyesi</label>
                  {isSuper
                    ? <select className="inp" value={form.role} onChange={e => setF('role', e.target.value)}>
                        {roles.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
                      </select>
                    : <div className="inp" style={{ color: '#555', cursor: 'not-allowed' }}>{ROLLER[form.role] || form.role}</div>
                  }
                </div>
                {isSuper && (
                  <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="mustChange" checked={form.mustChangePassword}
                      onChange={e => setF('mustChangePassword', e.target.checked)}
                      style={{ accentColor: '#f59e0b', width: 14, height: 14 }} />
                    <label htmlFor="mustChange" style={{ fontSize: 11, color: '#888', cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}>
                      İlk girişte şifre değiştirmeye zorla
                    </label>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 14, borderTop: '1px solid #111' }}>
                <button className="btn bO" onClick={closeEdit}>İptal</button>
                <button className="btn bA" onClick={save} disabled={saving} style={{ opacity: saving ? .7 : 1 }}>
                  {saving ? 'Kaydediliyor…' : editing === 'new' ? '+ Ekle' : '✓ Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
