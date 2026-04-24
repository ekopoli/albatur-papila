import React, { useState } from 'react'
import { fmt } from './constants.js'
import { updateJob } from './firebase.js'
import { InlineNumber } from './components.jsx'

export default function MuhasebeModal({ jobs, canEditAcc, onClose }) {
  const [sekme, setSekme] = useState('bekleyen') // bekleyen | odenmis

  // Tamamlanan tüm işler
  const tumTamamlananlar = jobs.filter(j => j.durum === 'tamamlandi' || j.durum === 'kapandi')

  // Ödenmiş: odenen >= ederi (tam ödeme) VEYA kapandi durumu
  const odenmis   = tumTamamlananlar.filter(j => {
    const ederi  = parseFloat(j.birimFiyat || 0) * parseFloat(j.adedi || 0)
    const odenen = parseFloat(j.odenen || 0)
    return ederi > 0 && odenen >= ederi
  })
  const bekleyen  = tumTamamlananlar.filter(j => {
    const ederi  = parseFloat(j.birimFiyat || 0) * parseFloat(j.adedi || 0)
    const odenen = parseFloat(j.odenen || 0)
    return !(ederi > 0 && odenen >= ederi)
  })

  const liste = sekme === 'odenmis' ? odenmis : bekleyen

  const topla = (arr) => ({
    ederi:  arr.reduce((s, j) => s + parseFloat(j.birimFiyat || 0) * parseFloat(j.adedi || 0), 0),
    odenen: arr.reduce((s, j) => s + parseFloat(j.odenen || 0), 0),
    kalan:  arr.reduce((s, j) => {
      const e = parseFloat(j.birimFiyat || 0) * parseFloat(j.adedi || 0)
      const o = parseFloat(j.odenen || 0)
      return s + (e - o)
    }, 0)
  })

  const t = topla(liste)

  const th = (right) => ({
    fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, fontSize: 9,
    letterSpacing: '.13em', textTransform: 'uppercase', padding: '10px 12px',
    textAlign: right ? 'right' : 'left', borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, background: 'var(--bg4)', whiteSpace: 'nowrap', zIndex: 10
  })

  const toggleOdeme = async (job) => {
    const ederi  = parseFloat(job.birimFiyat || 0) * parseFloat(job.adedi || 0)
    const odenen = parseFloat(job.odenen || 0)
    const tamOdendi = ederi > 0 && odenen >= ederi
    if (tamOdendi) {
      // Geri al — ödenen sıfırla
      await updateJob(job.id, { odenen: '', durum: 'tamamlandi' })
    } else if (ederi > 0) {
      const bugun = new Date().toISOString().slice(0, 10)
      await updateJob(job.id, { odenen: ederi.toString(), durum: 'kapandi', odemeTarihi: job.odemeTarihi || bugun })
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg4)', border: '1px solid var(--border4)', borderRadius: 8, width: '96vw', maxWidth: 1000, height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        {/* Başlık */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#d97706', fontFamily: "'IBM Plex Sans',sans-serif" }}>₺ Muhasebe</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Sekmeler */}
            <div style={{ display: 'flex', background: 'var(--bg5)', border: '1px solid var(--border2)', borderRadius: 6, padding: 3, gap: 2 }}>
              <button onClick={() => setSekme('bekleyen')}
                style={{ padding: '5px 16px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: sekme === 'bekleyen' ? 600 : 400, fontFamily: "'IBM Plex Sans',sans-serif", background: sekme === 'bekleyen' ? 'var(--border4)' : 'transparent', color: sekme === 'bekleyen' ? '#f87171' : 'var(--text4)', transition: 'all .15s' }}>
                Ödeme Bekleyen
                <span style={{ marginLeft: 6, fontSize: 9, color: sekme === 'bekleyen' ? '#f87171' : 'var(--text5)' }}>{bekleyen.length}</span>
              </button>
              <button onClick={() => setSekme('odenmis')}
                style={{ padding: '5px 16px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: sekme === 'odenmis' ? 600 : 400, fontFamily: "'IBM Plex Sans',sans-serif", background: sekme === 'odenmis' ? 'var(--border4)' : 'transparent', color: sekme === 'odenmis' ? '#4ade80' : 'var(--text4)', transition: 'all .15s' }}>
                Ödemesi Yapılanlar
                <span style={{ marginLeft: 6, fontSize: 9, color: sekme === 'odenmis' ? '#4ade80' : 'var(--text5)' }}>{odenmis.length}</span>
              </button>
            </div>
            <button className="btn bG" style={{ fontSize: 16 }} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Liste */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ ...th(false), color: 'var(--text3)' }}>Kod</th>
                <th style={{ ...th(false), color: 'var(--text3)' }}>Kategori</th>
                <th style={{ ...th(false), color: 'var(--text3)' }}>S. Veren</th>
                <th style={{ ...th(true), color: '#d97706' }}>Birim Fiyat</th>
                <th style={{ ...th(true), color: '#d97706' }}>Adet</th>
                <th style={{ ...th(true), color: '#d97706' }}>Ederi</th>
                <th style={{ ...th(true), color: '#d97706' }}>Ödenen</th>
                <th style={{ ...th(true), color: '#d97706' }}>Kalan</th>
                <th style={{ ...th(false), color: 'var(--text3)' }}>Ödeme Tarihi</th>
                <th style={{ ...th(true), color: '#4ade80', width: 60 }}>Ödendi</th>
              </tr>
            </thead>
            <tbody>
              {liste.length === 0
                ? <tr><td colSpan={10} style={{ textAlign: 'center', padding: 48, color: 'var(--text5)', fontSize: 11 }}>
                    {sekme === 'bekleyen' ? '— Ödeme bekleyen iş yok —' : '— Henüz ödenmiş iş yok —'}
                  </td></tr>
                : liste.map(job => {
                  const ederi  = parseFloat(job.birimFiyat || 0) * parseFloat(job.adedi || 0)
                  const odenen = parseFloat(job.odenen || 0)
                  const kalan  = ederi - odenen
                  const tamOdendi = ederi > 0 && odenen >= ederi
                  return (
                    <tr key={job.id} style={{ opacity: sekme === 'odenmis' ? 0.7 : 1 }}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {job.kodu || job.sinifi || '—'}
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)', fontSize: 12, whiteSpace: 'nowrap' }}>{job.kategori || '—'}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)', fontSize: 12, whiteSpace: 'nowrap' }}>{job.siparisiVeren || '—'}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)', textAlign: 'right' }}>
                        {canEditAcc
                          ? <InlineNumber value={job.birimFiyat} onChange={v => updateJob(job.id, { birimFiyat: v })} width={90} />
                          : <span style={{ fontSize: 12 }}>{job.birimFiyat ? fmt(job.birimFiyat) : '—'}</span>}
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)', textAlign: 'right' }}>
                        {canEditAcc
                          ? <input className="inp" type="number" style={{ width: 54, textAlign: 'center' }}
                              key={`ad-${job.id}-${job.adedi}`} defaultValue={job.adedi || ''}
                              placeholder="0" onBlur={e => updateJob(job.id, { adedi: e.target.value })} />
                          : <span style={{ fontSize: 12 }}>{job.adedi || '—'}</span>}
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)', textAlign: 'right', fontSize: 12, color: 'var(--text)' }}>{ederi > 0 ? fmt(ederi) : '—'}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)', textAlign: 'right' }}>
                        {canEditAcc
                          ? <InlineNumber value={job.odenen} onChange={v => {
                              const upd = { odenen: v }
                              const val = parseFloat(v || 0)
                              if (ederi > 0 && val >= ederi) {
                                upd.durum = 'kapandi'
                                if (!job.odemeTarihi) upd.odemeTarihi = new Date().toISOString().slice(0, 10)
                              } else if (job.durum === 'kapandi') upd.durum = 'tamamlandi'
                              updateJob(job.id, upd)
                            }} width={90} />
                          : <span style={{ fontSize: 12, color: '#4ade80' }}>{job.odenen ? fmt(job.odenen) : '—'}</span>}
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)', textAlign: 'right', fontSize: 12, fontWeight: 500, color: kalan <= 0 ? '#4ade80' : '#f87171' }}>
                        {(ederi > 0 || odenen > 0) ? fmt(kalan) : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)' }}>
                        {canEditAcc
                          ? <input className="inp" type="date" style={{ width: 118 }}
                              key={`dt-${job.id}-${job.odemeTarihi}`} defaultValue={job.odemeTarihi || ''}
                              onChange={e => updateJob(job.id, { odemeTarihi: e.target.value })} />
                          : <span style={{ fontSize: 12, color: 'var(--text3)' }}>{job.odemeTarihi || '—'}</span>}
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--bg6)', textAlign: 'center' }}>
                        <input type="checkbox" checked={tamOdendi}
                          onChange={() => canEditAcc && toggleOdeme(job)}
                          style={{ width: 16, height: 16, accentColor: '#4ade80', cursor: canEditAcc ? 'pointer' : 'default' }} />
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

        {/* Sabit toplam */}
        <div style={{ flexShrink: 0, borderTop: '2px solid var(--border4)', background: 'var(--bg2)', padding: '14px 22px' }}>
          <div style={{ fontSize: 8, color: 'var(--text4)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'IBM Plex Sans',sans-serif", marginBottom: 12 }}>
            {sekme === 'bekleyen' ? 'Ödeme Bekleyenler Toplamı' : 'Ödemesi Yapılanlar Toplamı'}
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
            {[
              { l: 'Toplam Ederi', v: t.ederi, c: 'var(--text2)' },
              { l: 'Toplam Ödenen', v: t.odenen, c: '#4ade80' },
              { l: 'Kalan', v: t.kalan, c: t.kalan > 0 ? '#f87171' : '#4ade80' }
            ].map(({ l, v, c }, i) => (
              <React.Fragment key={l}>
                {i > 0 && <div style={{ width: 1, height: 44, background: 'var(--border4)', alignSelf: 'center' }} />}
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text4)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'IBM Plex Sans',sans-serif", marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: c, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '-0.02em' }}>{fmt(v)}</div>
                  <div style={{ fontSize: 9, color: 'var(--text5)', marginTop: 2 }}>₺</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
