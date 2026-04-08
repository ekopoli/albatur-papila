import React, { useState } from 'react'
import { ROLLER } from './constants.js'
import { saveUserToDB, updateUserInDB, deleteUserFromDB } from './firebase.js'

// ─── Revizyon Modal ────────────────────────────────────────────────────────────
export function RevizyonModal({ job, onConfirm, onClose }) {
  const [not, setNot] = useState('')
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mbox" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c084fc', fontFamily: "'IBM Plex Sans',sans-serif" }}>↩ Revizyona Al</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{job.kodu || '—'} · {job.kategori || '—'}</div>
          </div>
          <button className="btn bG" style={{ fontSize: 16, padding: '3px 10px' }} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 22 }}>
          <label className="flbl">Revizyon Açıklaması</label>
          <textarea className="inp" rows={5} autoFocus placeholder="İstenilen revizyonları buraya yazın…" value={not} onChange={e => setNot(e.target.value)} style={{ resize: 'vertical', lineHeight: 1.6 }} />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 14, borderTop: '1px solid #111' }}>
            <button className="btn bO" onClick={onClose}>İptal</button>
            <button className="btn" style={{ background: 'rgba(192,132,252,.15)', color: '#c084fc', border: '1px solid rgba(192,132,252,.3)' }} onClick={() => onConfirm(not)}>↩ Revizyona Gönder</button>
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
                  <select className="inp" value={form.role} onChange={e => setF('role', e.target.value)}>
                    {roles.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="mustChange" checked={form.mustChangePassword}
                    onChange={e => setF('mustChangePassword', e.target.checked)}
                    style={{ accentColor: '#f59e0b', width: 14, height: 14 }} />
                  <label htmlFor="mustChange" style={{ fontSize: 11, color: '#888', cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}>
                    İlk girişte şifre değiştirmeye zorla
                  </label>
                </div>
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
