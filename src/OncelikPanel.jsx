import React, { useState } from 'react'
import { updateJob } from './firebase.js'

async function sikaistir(beklemedekiler, hedefId, hedefNo) {
  // Hedef iş hedefNo'ya atanıyor
  // Diğer işlerin mevcut onceliklerini koru, hedefNo dolduysa ötele
  // Sonra tümünü 1'den tekrar sırala

  const diger = beklemedekiler.filter(j => j.id !== hedefId && j.oncelik)
  
  // hedefNo zaten başka birine atanmışsa onu kaldır
  const eskiSahibi = diger.find(j => j.oncelik === hedefNo)
  if (eskiSahibi) {
    await updateJob(eskiSahibi.id, { oncelik: null })
  }

  // Hedef işe yeni numarayı ata
  await updateJob(hedefId, { oncelik: hedefNo })

  // Güncel listeyi yeniden oluştur
  const guncellenmis = beklemedekiler
    .filter(j => j.id !== hedefId && j.id !== (eskiSahibi?.id))
    .filter(j => j.oncelik)
    .concat([{ id: hedefId, oncelik: hedefNo }])
    .sort((a, b) => a.oncelik - b.oncelik)

  // 1'den başlayarak sıkıştır
  for (let i = 0; i < guncellenmis.length; i++) {
    const yeniNo = i + 1
    if (guncellenmis[i].oncelik !== yeniNo) {
      await updateJob(guncellenmis[i].id, { oncelik: yeniNo })
    }
  }
}

export default function OncelikPanel({ job, beklemedekiler, onClose }) {
  const [saving, setSaving] = useState(false)

  const alinmis = beklemedekiler
    .filter(j => j.id !== job.id && j.oncelik)
    .reduce((acc, j) => { acc[j.oncelik] = j; return acc }, {})

  const mevcutOncelik = job.oncelik || null

  const sec = async (num) => {
    if (saving) return
    setSaving(true)
    await sikaistir(beklemedekiler, job.id, num)
    setSaving(false)
    onClose()
  }

  const kaldir = async () => {
    if (!mevcutOncelik || saving) { onClose(); return }
    setSaving(true)
    // Bu işin önceliğini kaldır, kalanları 1'den sıkıştır
    await updateJob(job.id, { oncelik: null })
    const kalanlar = beklemedekiler
      .filter(j => j.id !== job.id && j.oncelik)
      .sort((a, b) => a.oncelik - b.oncelik)
    for (let i = 0; i < kalanlar.length; i++) {
      const yeniNo = i + 1
      if (kalanlar[i].oncelik !== yeniNo) {
        await updateJob(kalanlar[i].id, { oncelik: yeniNo })
      }
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0c0c0c', border: '1px solid #2a2a2a', borderRadius: 8, padding: 22, maxWidth: 340, width: '90%' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', fontFamily: "'IBM Plex Sans',sans-serif" }}>Öncelik Sırası</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 2, fontFamily: "'IBM Plex Mono',monospace" }}>
              {job.kodu || '—'} · {job.kategori || '—'}
            </div>
          </div>
          <button className="btn bG" style={{ fontSize: 16 }} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 14 }}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map(num => {
            const alan = alinmis[num]
            const secili = mevcutOncelik === num
            const dolu = !!alan

            return (
              <button key={num} onClick={() => !saving && sec(num)}
                title={alan ? `${alan.kodu || '—'} — ${alan.siparisiVeren || '—'}` : `${num}. öncelik`}
                style={{
                  padding: '8px 4px', borderRadius: 5, border: 'none',
                  cursor: saving ? 'wait' : 'pointer',
                  fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace",
                  transition: 'all .15s',
                  background: secili ? '#f59e0b' : dolu ? '#1a1a1a' : '#161616',
                  color: secili ? '#000' : dolu ? '#444' : '#888',
                  outline: secili ? 'none' : dolu ? '1px solid #222' : '1px solid #222',
                  opacity: saving ? .5 : 1,
                }}
                onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = secili ? '#fbbf24' : 'rgba(245,158,11,.15)'; e.currentTarget.style.color = secili ? '#000' : '#f59e0b'; e.currentTarget.style.outline = '1px solid rgba(245,158,11,.4)' }}}
                onMouseLeave={e => { e.currentTarget.style.background = secili ? '#f59e0b' : dolu ? '#1a1a1a' : '#161616'; e.currentTarget.style.color = secili ? '#000' : dolu ? '#444' : '#888'; e.currentTarget.style.outline = secili ? 'none' : '1px solid #222' }}>
                {num}
              </button>
            )
          })}
        </div>

        {saving && <div style={{ fontSize: 10, color: '#f59e0b', textAlign: 'center', marginBottom: 10, letterSpacing: '0.1em' }}>Sıralama güncelleniyor…</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: 9, color: '#444', fontFamily: "'IBM Plex Sans',sans-serif" }}>
            Seçim değişince sıralama otomatik 1'den başlar
          </div>
          {mevcutOncelik && (
            <button className="btn bR" style={{ fontSize: 10 }} onClick={kaldir} disabled={saving}>
              Kaldır
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
