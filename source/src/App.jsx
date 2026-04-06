import React, { useState, useEffect } from 'react'
import { listenJobs, addJob, updateJob, deleteJob, getUsers } from './firebase.js'
import { CSS, LOGO, DURUM_RENK, fmt } from './constants.js'
import Login from './Login.jsx'
import JobRow from './JobRow.jsx'
import JobForm from './JobForm.jsx'
import { RevizyonModal, UsersPanel } from './Modals.jsx'

const isAktif = (d) => d !== 'kapandi'

export default function App() {
  const [session, setSession] = useState(null)
  const [users] = useState(() => getUsers())
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('main')          // main | users
  const [tab, setTab] = useState('aktif')           // aktif | kapandi | all
  const [subTab, setSubTab] = useState('all')       // all | beklemede | onayda | revizyonda | tamamlandi
  const [showAcc, setShowAcc] = useState(false)
  const [editJob, setEditJob] = useState(null)      // null | 'new' | job object
  const [revizyonJob, setRevizyonJob] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [mailAlert, setMailAlert] = useState(null)

  // Firebase listener
  useEffect(() => {
    const unsub = listenJobs((data) => {
      setJobs(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Auto-dismiss mail alert
  useEffect(() => {
    if (!mailAlert) return
    const t = setTimeout(() => setMailAlert(null), 10000)
    return () => clearTimeout(t)
  }, [mailAlert])

  const logout = () => { setSession(null); setPage('main') }

  const triggerMail = (job, type = 'new') => {
    const subj = type === 'new'
      ? `ALBATUR-Papila — Yeni Sipariş: ${job.kodu || ''} ${job.kategori || ''}`
      : `↩ ALBATUR-Papila — Revizyon: ${job.kodu || ''} ${job.kategori || ''}`
    const body = type === 'new'
      ? `Yeni sipariş kaydedildi.\n\nTarih: ${job.siparisTarihi || '—'}\nSınıf: ${job.sinifi || '—'}\nKod: ${job.kodu || '—'}\nKategori: ${job.kategori || '—'}\nAçıklama: ${job.aciklama || '—'}\nSiparişi Veren: ${job.siparisiVeren || '—'}\nTeslim: ${job.teslimTarihi || '—'}`
      : `Revizyon alındı.\n\nKod: ${job.kodu || '—'}\nKategori: ${job.kategori || '—'}\nSiparişi Veren: ${job.siparisiVeren || '—'}\n\nRevizyon Notu:\n${job.revizyonNotu || '(yok)'}`
    setMailAlert({
      href: `mailto:ipapila@gmail.com?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`,
      label: type === 'new' ? `📋 Yeni sipariş: ${job.kodu || ''} ${job.kategori || ''}` : `↩ Revizyon: ${job.kodu || ''} ${job.kategori || ''}`
    })
  }

  const handleSave = async (jobData) => {
    if (jobData.id) {
      await updateJob(jobData.id, jobData)
    } else {
      const newJob = await addJob(jobData)
      triggerMail(jobData, 'new')
    }
    setEditJob(null)
  }

  const handleUpdate = (id, changes) => updateJob(id, changes)

  const handleDelete = async (id) => {
    await deleteJob(id)
    setDeleteConfirm(null)
  }

  const handleRevizyon = async (job, not) => {
    await updateJob(job.id, { durum: 'revizyonda', revizyonNotu: not })
    triggerMail({ ...job, revizyonNotu: not }, 'revizyon')
    setRevizyonJob(null)
  }

  // Permissions
  const canEdit = session?.role !== 'guest'
  const canAcc = session?.role === 'super' || session?.role === 'accview'
  const canEditAcc = session?.role === 'super'
  const showAccPanel = showAcc && canAcc

  // Filtering
  const filtered = jobs.filter(j => {
    const d = j.durum || 'beklemede'
    if (tab === 'kapandi') return d === 'kapandi'
    if (tab === 'all') return true
    // aktif
    if (subTab === 'all') return isAktif(d) && d !== 'beklemede'
    return d === subTab
  })

  // Counts
  const cnt = (t) => {
    if (t === 'aktif') return jobs.filter(j => isAktif(j.durum || 'beklemede')).length
    if (t === 'all') return jobs.length
    return jobs.filter(j => (j.durum || 'beklemede') === t).length
  }
  const subCnt = (s) => {
    if (s === 'all') return jobs.filter(j => isAktif(j.durum || 'beklemede') && (j.durum || 'beklemede') !== 'beklemede').length
    return jobs.filter(j => (j.durum || 'beklemede') === s).length
  }

  // Totals
  const totalEderi = jobs.filter(j => j.durum !== 'kapandi').reduce((s, j) => s + parseFloat(j.birimFiyat || 0) * parseFloat(j.adedi || 0), 0)
  const totalOdenen = jobs.reduce((s, j) => s + parseFloat(j.odenen || 0), 0)
  const totalKalan = totalEderi - totalOdenen

  if (!session) return <><style>{CSS}</style><Login users={users} onLogin={setSession} /></>
  if (loading) return <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 11, letterSpacing: '0.15em' }}><style>{CSS}</style>Bağlanıyor…</div>

  const DURUM_CLR = DURUM_RENK

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace", background: '#080808', minHeight: '100vh', color: '#e0e0e0' }}>
      <style>{CSS}</style>

      {/* Header */}
      <header style={{ background: '#0a0a0a', borderBottom: '1px solid #141414', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 50, position: 'sticky', top: 0, zIndex: 40 }}>
        <img src={LOGO} alt="ALBATUR" style={{ height: 28, objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {canAcc && <button className={`btn bO ${showAcc ? 'on' : ''}`} onClick={() => setShowAcc(v => !v)}>₺ Muhasebe</button>}
          {session.role === 'super' && <button className={`btn bO ${page === 'users' ? 'on' : ''}`} onClick={() => setPage(p => p === 'users' ? 'main' : 'users')}>Kullanıcılar</button>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: '#0e0e0e', borderRadius: 4, border: '1px solid #181818' }}>
            <span style={{ fontSize: 12, color: '#c0c0c0', fontWeight: 500 }}>{session.displayName}</span>
            <button className="btn bG" onClick={logout}>Çıkış</button>
          </div>
        </div>
      </header>

      <div style={{ padding: '18px 20px' }}>
        {page === 'users' && session.role === 'super'
          ? <UsersPanel session={session} />
          : <>
            {/* Controls */}
            <div style={{ marginBottom: 14 }}>
              {canEdit && <div style={{ marginBottom: 10 }}><button className="btn bA" onClick={() => setEditJob('new')}>+ Yeni Sipariş</button></div>}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 7, padding: 3, gap: 2 }}>
                  {/* Aktif toggle */}
                  <button onClick={() => setTab(t => t === 'aktif' ? 'all' : 'aktif')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 500, fontFamily: "'IBM Plex Sans',sans-serif", background: tab === 'aktif' ? 'rgba(245,158,11,.08)' : 'transparent', color: tab === 'aktif' ? '#f59e0b' : '#444', transition: 'all .15s' }}>
                    Aktif <span style={{ fontSize: 9, color: tab === 'aktif' ? 'rgba(245,158,11,.5)' : '#2e2e2e' }}>{cnt('aktif')}</span>
                    <span style={{ fontSize: 8, color: tab === 'aktif' ? '#f59e0b' : '#2e2e2e', marginLeft: 1 }}>{tab === 'aktif' ? '▾' : '▸'}</span>
                  </button>
                  {[['kapandi', 'Kapandı'], ['all', 'Tümü']].map(([k, l]) => {
                    const sel = tab === k
                    return (
                      <button key={k} onClick={() => { setTab(k); setSubTab('all') }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: sel ? 600 : 400, fontFamily: "'IBM Plex Sans',sans-serif", background: sel ? '#1e1e1e' : 'transparent', color: sel ? (DURUM_CLR[k] || '#e0e0e0') : '#444', boxShadow: sel ? '0 1px 3px rgba(0,0,0,.4)' : 'none', transition: 'all .15s' }}>
                        {DURUM_CLR[k] && <span style={{ width: 5, height: 5, borderRadius: '50%', background: DURUM_CLR[k], display: 'inline-block', opacity: sel ? 1 : .4 }} />}
                        {l} <span style={{ fontSize: 9, color: sel ? (DURUM_CLR[k] || '#666') : '#2e2e2e' }}>{cnt(k)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sub-tabs (aktif only) */}
              {tab === 'aktif' && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 4 }}>
                  <span style={{ fontSize: 9, color: '#2a2a2a', marginRight: 2, fontFamily: "'IBM Plex Sans',sans-serif" }}>└</span>
                  {[['all', 'Üretimde', null], ['beklemede', 'Beklemede', '#c0c0c0'], ['onayda', 'Onayda', '#f59e0b'], ['revizyonda', 'Revizyonda', '#c084fc'], ['tamamlandi', 'Tamamlandı', '#4ade80']].map(([k, l, c]) => {
                    const sel = subTab === k
                    return (
                      <button key={k} onClick={() => setSubTab(k)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 11px', borderRadius: 4, border: `1px solid ${sel ? '#333' : 'transparent'}`, cursor: 'pointer', fontSize: 10, fontWeight: sel ? 600 : 400, fontFamily: "'IBM Plex Sans',sans-serif", background: sel ? '#1e1e1e' : 'transparent', color: sel ? (c || '#e0e0e0') : '#3a3a3a', boxShadow: sel ? '0 1px 3px rgba(0,0,0,.4)' : 'none', transition: 'all .15s' }}>
                        {c && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, display: 'inline-block', opacity: sel ? 1 : .4 }} />}
                        {l} <span style={{ fontSize: 9, color: sel ? (c || '#777') : '#2a2a2a' }}>{subCnt(k)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Table */}
            <div style={{ background: '#0b0b0b', border: '1px solid #141414', borderRadius: 6, overflow: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Sipariş Tarihi</th><th>Sınıfı</th><th>Kodu</th><th>Kategori</th>
                    <th style={{ minWidth: 160 }}>Açıklama</th><th>Siparişi Veren</th>
                    <th>Onaya Gidiş</th><th>Teslim Tarihi</th>
                    <th style={{ minWidth: 120 }}>Durum</th>
                    {canEdit && <th style={{ width: 128 }} />}
                    {showAccPanel && <>
                      <th className="acc-sep" style={{ color: '#d97706' }}>Birim Fiyat</th>
                      <th style={{ color: '#d97706' }}>Adedi</th>
                      <th style={{ color: '#d97706' }}>Ederi</th>
                      <th style={{ color: '#d97706' }}>Ödenen</th>
                      <th style={{ color: '#d97706' }}>Kalan</th>
                      <th style={{ color: '#d97706' }}>Ödeme Tarihi</th>
                      <th style={{ color: '#d97706', width: 58, textAlign: 'center' }}>Ödendi</th>
                    </>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={30} style={{ textAlign: 'center', padding: 52, color: '#222', fontSize: 11, letterSpacing: '0.12em' }}>— Kayıt bulunamadı —</td></tr>
                    : filtered.map((job, i) => (
                      <JobRow key={job.id} job={job} idx={i + 1}
                        canEdit={canEdit} showAcc={showAccPanel} canEditAcc={canEditAcc}
                        onRowClick={() => canEdit && setEditJob(job)}
                        onUpdate={(changes) => handleUpdate(job.id, changes)}
                        onDelete={() => setDeleteConfirm(job.id)}
                        onRevizyon={() => setRevizyonJob(job)} />
                    ))
                  }
                </tbody>
                {showAccPanel && filtered.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#090909', borderTop: '2px solid #1e1e1e' }}>
                      <td colSpan={canEdit ? 13 : 12} style={{ textAlign: 'right', fontSize: 9, color: '#2e2e2e', letterSpacing: '0.15em', paddingRight: 14, fontFamily: "'IBM Plex Sans',sans-serif" }}>GENEL TOPLAM</td>
                      <td style={{ fontWeight: 600, color: '#c0c0c0', fontSize: 12 }}>{fmt(totalEderi)}</td>
                      <td style={{ fontWeight: 600, color: '#4ade80', fontSize: 12 }}>{fmt(totalOdenen)}</td>
                      <td style={{ fontWeight: 600, color: totalKalan > 0 ? '#f87171' : '#4ade80', fontSize: 12 }}>{fmt(totalKalan)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {showAccPanel && <div style={{ marginTop: 8, fontSize: 9, color: '#2e2e2e', letterSpacing: '0.1em' }}>* Ederi toplamı yalnızca tamamlanmamış işleri kapsar.</div>}
          </>
        }
      </div>

      {/* Modals */}
      {editJob && (
        <JobForm
          job={editJob === 'new' ? null : editJob}
          session={session} canAcc={canAcc}
          onSave={handleSave}
          onClose={() => setEditJob(null)} />
      )}

      {revizyonJob && (
        <RevizyonModal job={revizyonJob}
          onConfirm={(not) => handleRevizyon(revizyonJob, not)}
          onClose={() => setRevizyonJob(null)} />
      )}

      {deleteConfirm && (
        <div className="overlay" onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 8, padding: 28, maxWidth: 300, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⚠</div>
            <div style={{ fontSize: 13, color: '#e0e0e0', marginBottom: 6, fontFamily: "'IBM Plex Sans',sans-serif" }}>Kaydı silmek istiyor musunuz?</div>
            <div style={{ fontSize: 10, color: '#444', marginBottom: 22, fontFamily: "'IBM Plex Sans',sans-serif" }}>Bu işlem geri alınamaz.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn bO" onClick={() => setDeleteConfirm(null)}>İptal</button>
              <button className="btn" style={{ background: '#c0392b', color: '#fff' }} onClick={() => handleDelete(deleteConfirm)}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Mail alert */}
      {mailAlert && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', zIndex: 200, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 24px rgba(0,0,0,.6)', maxWidth: 340, width: '90%' }}>
          <span style={{ fontSize: 11, color: '#888', flex: 1, fontFamily: "'IBM Plex Sans',sans-serif" }}>{mailAlert.label}</span>
          <a href={mailAlert.href} onClick={() => setMailAlert(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 4, background: '#f59e0b', color: '#000', fontSize: 11, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>📧 Mail Gönder</a>
          <button onClick={() => setMailAlert(null)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}
    </div>
  )
}
