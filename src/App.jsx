import React, { useState, useEffect } from 'react'
import { listenJobs, addJob, updateJob, deleteJob,
         listenCustomCodes, listenCustomKategoriler, listenCustomSiniflar,
         listenUsers, saveUserToDB, updateUserInDB, deleteUserFromDB, initUsersIfEmpty,
         db, jobsRef } from './firebase.js'
import { getDatabase, ref, get } from 'firebase/database'
import { CSS, LOGO, DURUM_RENK, fmt, TEMALAR } from './constants.js'
import Login from './Login.jsx'
import JobRow from './JobRow.jsx'
import JobForm from './JobForm.jsx'
import ImportModal from './ImportModal.jsx'
import MuhasebeModal from './MuhasebeModal.jsx'
import OncelikPanel from './OncelikPanel.jsx'
import { RevizyonModal, UsersPanel } from './Modals.jsx'
import emailjs from '@emailjs/browser'

const isAktif = (d) => d !== 'kapandi'

export default function App() {
  const [session, setSession] = useState(null)
  const [tema, setTema] = useState(() => localStorage.getItem('alb_tema') || 'dark')

  // Tema CSS değişkenlerini uygula
  useEffect(() => {
    const vars = TEMALAR[tema] || TEMALAR.dark
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v))
    localStorage.setItem('alb_tema', tema)
  }, [tema])

  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('main')
  const [tab, setTab] = useState('aktif')
  const [subTab, setSubTab] = useState('uretimde')
  const [showAcc, setShowAcc] = useState(false)
  const [showMuhasebe, setShowMuhasebe] = useState(false)
  const [editJob, setEditJob] = useState(null)
  const [revizyonJob, setRevizyonJob] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [mailAlert, setMailAlert] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [oncelikJob, setOncelikJob] = useState(null)
  const [arama, setArama] = useState('')

  // Custom data
  const [customCodes, setCustomCodes] = useState({})
  const [rawCustomCodes, setRawCustomCodes] = useState({})
  const [customKategoriler, setCustomKategoriler] = useState([])
  const [customSiniflar, setCustomSiniflar] = useState([])

  // ---------- Bildirim İzni ----------
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission)

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirimleri desteklemiyor.')
      return
    }
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
  }

  // Uygulama yüklendiğinde izin iste (kullanıcı giriş yaptıktan sonra daha uygun)
  useEffect(() => {
    if (session && notificationPermission === 'default') {
      requestNotificationPermission()
    }
  }, [session])

  // Yardımcı bildirim fonksiyonu
  const showNotification = (title, body) => {
    if (notificationPermission === 'granted') {
      new Notification(title, { body, icon: LOGO })
    }
  }

  // ---------- Otomatik Mail (EmailJS) ----------
  // EmailJS'i başlat (public key ile)
  useEffect(() => {
    emailjs.init('vFzf9dPBuudScrCmO') // <-- EmailJS Public Key'inizi buraya yazın
  }, [])

  const sendEmail = async (subject, message) => {
    try {
      await emailjs.send(
        'service_de851xr',   // <-- EmailJS Service ID
        'template_bvyl1qe',  // <-- EmailJS Template ID
        { subject, message }
      )
      console.log('Mail gönderildi')
    } catch (error) {
      console.error('Mail gönderilemedi:', error)
    }
  }

  // Firebase listeners
  useEffect(() => {
    initUsersIfEmpty()
    const u1 = listenJobs((data) => { setJobs(data); setLoading(false) })
    const u2 = listenCustomCodes((parsed, raw) => { setCustomCodes(parsed); setRawCustomCodes(raw) })
    const u3 = listenCustomKategoriler(setCustomKategoriler)
    const u4 = listenCustomSiniflar(setCustomSiniflar)
    const u5 = listenUsers(setUsers)
    return () => { u1(); u2(); u3(); u4(); u5() }
  }, [])

  // Otomatik giriş kontrolü
  useEffect(() => {
    const saved = localStorage.getItem('alb_session')
    if (saved) {
      try {
        const user = JSON.parse(saved)
        setSession(user)
      } catch (e) {
        localStorage.removeItem('alb_session')
      }
    }
  }, [])

  // Auto-dismiss mail alert (mevcut)
  useEffect(() => {
    if (!mailAlert) return
    const t = setTimeout(() => setMailAlert(null), 10000)
    return () => clearTimeout(t)
  }, [mailAlert])

  const logout = () => {
    setSession(null)
    setPage('main')
    localStorage.removeItem('alb_session')
  }

  const handleLogin = (user, remember) => {
    setSession(user)
    if (remember) {
      localStorage.setItem('alb_session', JSON.stringify(user))
    } else {
      localStorage.removeItem('alb_session')
    }
  }

  // Beklemede öncelikleri her zaman 1'den sıkıştır
  const oncelikSikistir = async () => {
    const snap = await get(ref(db, 'jobs'))
    const data = snap.val() || {}
    const kalanlar = Object.entries(data)
      .map(([key, v]) => ({ ...v, _key: key }))
      .filter(j => (j.durum || 'beklemede') === 'beklemede' && j.oncelik)
      .sort((a, b) => a.oncelik - b.oncelik)

    const { update: fbUpdate } = await import('firebase/database')
    const batch = {}
    kalanlar.forEach((j, i) => {
      const yeniNo = i + 1
      if (j.oncelik !== yeniNo) {
        batch[`jobs/${j._key}/oncelik`] = yeniNo
      }
    })
    if (Object.keys(batch).length > 0) {
      const { ref: fbRef } = await import('firebase/database')
      await fbUpdate(fbRef(db), batch)
    }
  }

  const handleSave = async (jobData) => {
    try {
      const eskiJob = jobs.find(j => j.id === jobData.id)
      const beklemedeCikiyor = eskiJob?.durum === 'beklemede' && jobData.durum && jobData.durum !== 'beklemede'
      if (jobData.id) {
        await updateJob(jobData.id, beklemedeCikiyor ? { ...jobData, oncelik: null } : jobData)
        if (beklemedeCikiyor) await oncelikSikistir()
      } else {
        await addJob(jobData)
        // Yeni sipariş bildirimi ve mail
        showNotification('Yeni Sipariş', `${jobData.kodu || ''} ${jobData.kategori || ''} eklendi.`)
        sendEmail(
          `ALBATUR-Papila — Yeni Sipariş: ${jobData.kodu || ''} ${jobData.kategori || ''}`,
          `Yeni sipariş kaydedildi.\n\nTarih: ${jobData.siparisTarihi || '—'}\nSınıf: ${jobData.sinifi || '—'}\nKod: ${jobData.kodu || '—'}\nKategori: ${jobData.kategori || '—'}\nAçıklama: ${jobData.aciklama || '—'}\nSiparişi Veren: ${jobData.siparisiVeren || '—'}\nTeslim: ${jobData.teslimTarihi || '—'}`
        )
      }
      setEditJob(null)
    } catch (err) {
      console.error('Kayıt hatası:', err)
      alert('Kayıt sırasında hata oluştu: ' + err.message)
    }
  }

  const handleUpdate = async (id, changes) => {
    const job = jobs.find(j => j.id === id)
    const eskiDurum = job?.durum || 'beklemede'
    const yeniDurum = changes.durum

    await updateJob(id, changes)

    // Onay bildirimi (tamamlandi durumuna geçiş)
    if (yeniDurum === 'tamamlandi' && eskiDurum !== 'tamamlandi') {
      showNotification('Sipariş Onaylandı', `${job.kodu || ''} ${job.kategori || ''} tamamlandı olarak işaretlendi.`)
      sendEmail(
        `ALBATUR-Papila — Sipariş Onaylandı: ${job.kodu || ''} ${job.kategori || ''}`,
        `Sipariş onaylandı.\n\nKod: ${job.kodu || '—'}\nKategori: ${job.kategori || '—'}\nSiparişi Veren: ${job.siparisiVeren || '—'}`
      )
    }

    const beklemedeCikiyor = eskiDurum === 'beklemede' && yeniDurum && yeniDurum !== 'beklemede'
    if (beklemedeCikiyor) {
      await updateJob(id, { oncelik: null })
    }
    if (yeniDurum) await oncelikSikistir()
  }

  const handleDelete = async (id) => {
    await deleteJob(id)
    setDeleteConfirm(null)
  }

  const handleRevizyon = async (job, not, gorsel, linkler) => {
    const eskiDurum = job.durum || 'beklemede'
    await updateJob(job.id, {
      durum: 'revizyonda', revizyonNotu: not,
      revizyonGorsel: gorsel || '',
      revizyonLink1: (linkler && linkler[0]) || '',
      revizyonLink2: (linkler && linkler[1]) || '',
      revizyonLink3: (linkler && linkler[2]) || '',
      ...(eskiDurum === 'beklemede' ? { oncelik: null } : {})
    })
    if (eskiDurum === 'beklemede') await oncelikSikistir()

    // Revizyon bildirimi ve mail
    showNotification('Revizyon İstendi', `${job.kodu || ''} ${job.kategori || ''} revizyona alındı.`)
    sendEmail(
      `↩ ALBATUR-Papila — Revizyon: ${job.kodu || ''} ${job.kategori || ''}`,
      `Revizyon alındı.\n\nKod: ${job.kodu || '—'}\nKategori: ${job.kategori || '—'}\nSiparişi Veren: ${job.siparisiVeren || '—'}\n\nRevizyon Notu:\n${not || '(yok)'}`
    )

    setRevizyonJob(null)
  }

  // Permissions
  const canEdit = session?.role !== 'guest'
  const canAcc = session?.role === 'super' || session?.role === 'accview'
  const canEditAcc = session?.role === 'super'

  // Filtering + arama + sıralama
  const q = arama.trim().toLowerCase()
  const filtered = jobs.filter(j => {
    const d = j.durum || 'beklemede'
    if (tab === 'kapandi') return d === 'kapandi'
    if (tab === 'all') return true
    if (subTab === 'uretimde') return d === 'uretimde'
    return d === subTab
  }).filter(j => {
    if (!q) return true
    const sinifKod = `${j.sinifi || ''}-${j.kodu || ''}`.toLowerCase()
    return (
      sinifKod.includes(q) ||
      (j.kodu || '').toLowerCase().includes(q) ||
      (j.sinifi || '').toLowerCase().includes(q) ||
      (j.kategori || '').toLowerCase().includes(q) ||
      (j.aciklama || '').toLowerCase().includes(q) ||
      (j.siparisiVeren || '').toLowerCase().includes(q)
    )
  }).sort((a, b) => {
    if (subTab === 'beklemede') {
      const aO = a.oncelik || null
      const bO = b.oncelik || null
      if (aO && bO) return aO - bO
      if (aO) return -1
      if (bO) return 1
    }
    const aKey = `${a.sinifi || ''}-${a.kodu || ''}`.toLowerCase()
    const bKey = `${b.sinifi || ''}-${b.kodu || ''}`.toLowerCase()
    return aKey.localeCompare(bKey, 'tr', { numeric: true })
  })

  // Counts
  const cnt = (t) => {
    if (t === 'aktif') return jobs.filter(j => isAktif(j.durum || 'beklemede')).length
    if (t === 'all') return jobs.length
    return jobs.filter(j => (j.durum || 'beklemede') === t).length
  }
  const subCnt = (s) => {
    if (s === 'uretimde') return jobs.filter(j => (j.durum || 'beklemede') === 'uretimde').length
    return jobs.filter(j => (j.durum || 'beklemede') === s).length
  }

  // Totals
  const onaylilar = filtered.filter(j => j.durum === 'tamamlandi' || j.durum === 'kapandi')
  const totalEderi = onaylilar.reduce((s, j) => s + parseFloat(j.birimFiyat || 0) * parseFloat(j.adedi || 0), 0)
  const totalOdenen = onaylilar.reduce((s, j) => s + parseFloat(j.odenen || 0), 0)
  const totalKalan = filtered.reduce((s, j) => {
    const e = parseFloat(j.birimFiyat || 0) * parseFloat(j.adedi || 0)
    const o = parseFloat(j.odenen || 0)
    return s + (e - o)
  }, 0)

  if (!session) return <><style>{CSS}</style><Login users={users} onLogin={handleLogin} /></>
  if (loading) return <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 11, letterSpacing: '0.15em' }}><style>{CSS}</style>Bağlanıyor…</div>

  const DURUM_CLR = DURUM_RENK

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <style>{CSS}</style>

      {/* Header */}
      <header style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 50, position: 'sticky', top: 0, zIndex: 40 }}>
        <img src={LOGO} alt="ALBATUR" style={{ height: 28, objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {canAcc && <button className="btn bO" onClick={() => setShowMuhasebe(true)}>₺ Muhasebe</button>}
          {canEdit && <button className="btn bO" onClick={() => setShowImport(true)}>⬆ Excel İçe Aktar</button>}
          {session.role === 'super' && <button className={`btn bO ${page === 'users' ? 'on' : ''}`} onClick={() => setPage(p => p === 'users' ? 'main' : 'users')}>Kullanıcılar</button>}
          <div style={{ display: 'flex', background: 'var(--bg5)', border: '1px solid var(--border2)', borderRadius: 6, padding: 2, gap: 1 }}>
            {[['dark','🌑'],['dim','🌓'],['light','🌕']].map(([t, icon]) => (
              <button key={t} onClick={() => setTema(t)}
                title={t === 'dark' ? 'Koyu' : t === 'dim' ? 'Loş' : 'Açık'}
                style={{ background: tema === t ? 'var(--bg3)' : 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '3px 7px', fontSize: 13, opacity: tema === t ? 1 : 0.4, transition: 'all .15s' }}>
                {icon}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'var(--bg5)', borderRadius: 4, border: '1px solid #181818' }}>
            <span style={{ fontSize: 12, color: '#c0c0c0', fontWeight: 500 }}>{session.displayName}</span>
            <button className="btn bG" onClick={logout}>Çıkış</button>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 50px)' }}>
        {page === 'users' && session.role === 'super'
          ? <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}><UsersPanel users={users} session={session} /></div>
          : <>
            <div style={{ padding: '14px 20px 10px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: tab === 'aktif' ? 8 : 0 }}>
                {canEdit && <button className="btn bA" onClick={() => setEditJob('new')}>+ Yeni Sipariş</button>}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg5)', border: '1px solid var(--border2)', borderRadius: 7, padding: 3, gap: 2 }}>
                  <button onClick={() => setTab(t => t === 'aktif' ? 'all' : 'aktif')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 500, fontFamily: "'IBM Plex Sans',sans-serif", background: tab === 'aktif' ? 'rgba(245,158,11,.08)' : 'transparent', color: tab === 'aktif' ? '#f59e0b' : '#999', transition: 'all .15s' }}>
                    Aktif <span style={{ fontSize: 9, color: tab === 'aktif' ? 'rgba(245,158,11,.5)' : '#2e2e2e' }}>{cnt('aktif')}</span>
                    <span style={{ fontSize: 8, color: tab === 'aktif' ? '#f59e0b' : '#2e2e2e', marginLeft: 1 }}>{tab === 'aktif' ? '▾' : '▸'}</span>
                  </button>
                  {[['kapandi', 'Kapandı'], ['all', 'Tümü']].map(([k, l]) => {
                    const sel = tab === k
                    return (
                      <button key={k} onClick={() => { setTab(k); setSubTab('uretimde') }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: sel ? 600 : 400, fontFamily: "'IBM Plex Sans',sans-serif", background: sel ? '#1e1e1e' : 'transparent', color: sel ? (DURUM_CLR[k] || '#e0e0e0') : '#999', boxShadow: sel ? '0 1px 3px rgba(0,0,0,.4)' : 'none', transition: 'all .15s' }}>
                        {DURUM_CLR[k] && <span style={{ width: 5, height: 5, borderRadius: '50%', background: DURUM_CLR[k], display: 'inline-block', opacity: sel ? 1 : .4 }} />}
                        {l} <span style={{ fontSize: 9, color: sel ? (DURUM_CLR[k] || '#666') : '#2e2e2e' }}>{cnt(k)}</span>
                      </button>
                    )
                  })}
                </div>
                <div style={{ position: 'relative', marginLeft: 'auto' }}>
                  <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: 12, pointerEvents: 'none' }}>🔍</span>
                  <input
                    value={arama}
                    onChange={e => setArama(e.target.value)}
                    placeholder="Ara... (kod, kategori, açıklama)"
                    style={{ background: 'var(--bg5)', border: `1px solid ${arama ? '#f59e0b' : '#1a1a1a'}`, borderRadius: 6, padding: '5px 10px 5px 28px', color: 'var(--text)', fontSize: 11, outline: 'none', width: 220, fontFamily: "'IBM Plex Mono',monospace", transition: 'border-color .15s' }}
                  />
                  {arama && <button onClick={() => setArama('')}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>}
                </div>
              </div>
              {tab === 'aktif' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 4 }}>
                  <span style={{ fontSize: 9, color: '#666', marginRight: 2, fontFamily: "'IBM Plex Sans',sans-serif" }}>└</span>
                  {[['uretimde', 'Üretimde', null], ['beklemede', 'Beklemede', '#c0c0c0'], ['onayda', 'Onayda', '#f59e0b'], ['revizyonda', 'Revizyonda', '#c084fc'], ['tamamlandi', 'Tamamlandı', '#4ade80']].map(([k, l, c]) => {
                    const sel = subTab === k
                    return (
                      <button key={k} onClick={() => setSubTab(k)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 11px', borderRadius: 4, border: `1px solid ${sel ? '#333' : 'transparent'}`, cursor: 'pointer', fontSize: 10, fontWeight: sel ? 600 : 400, fontFamily: "'IBM Plex Sans',sans-serif", background: sel ? '#1e1e1e' : 'transparent', color: sel ? (c || '#e0e0e0') : '#999', boxShadow: sel ? '0 1px 3px rgba(0,0,0,.4)' : 'none', transition: 'all .15s' }}>
                        {c && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, display: 'inline-block', opacity: sel ? 1 : .4 }} />}
                        {l} <span style={{ fontSize: 9, color: sel ? (c || '#777') : '#666' }}>{subCnt(k)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
            <div style={{ background: 'var(--bg3)', borderTop: 'none', minHeight: '100%' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Sipariş Tarihi</th><th>Sınıf-Kod</th><th>Kategori</th>
                    <th style={{ minWidth: 160 }}>Açıklama</th><th>Siparişi Veren</th>
                    <th>Onaya Gidiş</th><th>Teslim Tarihi</th>
                    <th style={{ minWidth: 120 }}>Durum</th>
                    {canEdit && <th style={{ width: 128 }} />}
                  </tr>
                </thead>
                <tbody>
                {filtered.length === 0 ? (
  <tr><td colSpan={10} style={{ textAlign: 'center', padding: 52, color: '#222', fontSize: 11, letterSpacing: '0.12em' }}>— Kayıt bulunamadı —</td></tr>
) : (
  filtered.map((job, i) => (
    <JobRow
  key={job.id}
  job={job}
  idx={i + 1}
  canEdit={canEdit && job.durum !== 'kapandi'}   // 👈 SADECE BURADAN KONTROL EDİYORUZ
  showAcc={false}
  canEditAcc={false}
  onRowClick={() => canEdit && setEditJob(job)}
  onUpdate={(changes) => handleUpdate(job.id, changes)}
  onDelete={() => setDeleteConfirm(job.id)}
  onRevizyon={() => setRevizyonJob(job)}
  onOncelik={() => setOncelikJob(job)}
/>
  ))
)}
                </tbody>
              </table>
            </div>
            </div>
          </>
        }
      </div>

      {/* Modals */}
      {showMuhasebe && (
        <MuhasebeModal jobs={jobs} canEditAcc={canEditAcc} onClose={() => setShowMuhasebe(false)} />
      )}

      {oncelikJob && (
        <OncelikPanel
          job={oncelikJob}
          beklemedekiler={jobs.filter(j => (j.durum || 'beklemede') === 'beklemede')}
          onClose={() => setOncelikJob(null)} />
      )}

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onDone={() => {}} />
      )}

      {editJob && (
        <JobForm
          job={editJob === 'new' ? null : editJob}
          session={session} canAcc={canAcc}
          customCodes={customCodes}
          rawCustomCodes={rawCustomCodes}
          customKategoriler={customKategoriler}
          customSiniflar={customSiniflar}
          onSave={handleSave}
          onClose={() => setEditJob(null)} />
      )}

      {revizyonJob && (
        <RevizyonModal job={revizyonJob}
          onConfirm={(not, gorsel, linkler) => handleRevizyon(revizyonJob, not, gorsel, linkler)}
          onClose={() => setRevizyonJob(null)} />
      )}

      {deleteConfirm && (
        <div className="overlay" onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: 'var(--bg5)', border: '1px solid var(--border4)', borderRadius: 8, padding: 28, maxWidth: 300, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚠</div>
            <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6, fontFamily: "'IBM Plex Sans',sans-serif" }}>Kaydı silmek istiyor musunuz?</div>
            <div style={{ fontSize: 10, color: '#999', marginBottom: 22, fontFamily: "'IBM Plex Sans',sans-serif" }}>Bu işlem geri alınamaz.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn bO" onClick={() => setDeleteConfirm(null)}>İptal</button>
              <button className="btn" style={{ background: '#c0392b', color: '#fff' }} onClick={() => handleDelete(deleteConfirm)}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Mail alert (artık kullanılmıyor ama koruyalım) */}
      {mailAlert && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg5)', border: '1px solid var(--border4)', borderRadius: 8, padding: '12px 16px', zIndex: 200, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 24px rgba(0,0,0,.6)', maxWidth: 340, width: '90%' }}>
          <span style={{ fontSize: 11, color: '#888', flex: 1, fontFamily: "'IBM Plex Sans',sans-serif" }}>{mailAlert.label}</span>
          <a href={mailAlert.href} onClick={() => setMailAlert(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 4, background: '#f59e0b', color: '#000', fontSize: 11, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>📧 Mail Gönder</a>
          <button onClick={() => setMailAlert(null)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}
    </div>
  )
}
