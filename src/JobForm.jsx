import React, { useState } from 'react'
import { SINIFLAR, KODLAR, KATEGORILER, fmt, today } from './constants.js'
import { Lbl, RefThumb } from './components.jsx'
import {
  addCustomCode, deleteCustomCode,
  addCustomKategori, deleteCustomKategori,
  addCustomSinif, deleteCustomSinif
} from './firebase.js'

const EMPTY = {
  siparisTarihi: '', sinifi: '', kodu: '', kategori: '',
  aciklama: '', siparisiVeren: '',
  onayaGidisTarihi: '', teslimTarihi: '', durum: 'beklemede',
  birimFiyat: '', adedi: '', odenen: '', odemeTarihi: '',
  refGorsel: '', refLink1: '', refLink2: '', refLink3: ''
}

// ─── Liste Yönetim Penceresi ──────────────────────────────────────────────────
function ListeYoneticisi({ baslik, staticItems, customItems, rawData, onSecim, onKapat }) {
  const [yeni, setYeni] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const tumListe = [...staticItems, ...customItems]

  const ekle = async () => {
    const k = yeni.trim()
    if (!k) return
    if (tumListe.includes(k)) { alert('Bu değer zaten listede mevcut.'); return }
    setSaving(true)
    try {
      await baslik.onAdd(k)
      setYeni('')
    } catch (err) {
      alert('Eklenemedi: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const sil = async (item) => {
    setDeleting(item)
    await baslik.onDelete(item)
    setDeleting(null)
  }

  return (
    <div className="overlay" style={{ zIndex: 110 }} onClick={e => e.target === e.currentTarget && onKapat()}>
      <div style={{ background: '#0c0c0c', border: '1px solid #2a2a2a', borderRadius: 8, width: '100%', maxWidth: 420, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>

        {/* Başlık */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', fontFamily: "'IBM Plex Sans',sans-serif" }}>
              {baslik.label} Listesi
            </div>
            <div style={{ fontSize: 9, color: '#999', marginTop: 2 }}>
              Statik değerler silinemez · Özel değerler Firebase'de saklanır
            </div>
          </div>
          <button className="btn bG" style={{ fontSize: 16 }} onClick={onKapat}>✕</button>
        </div>

        {/* Liste — statik + özel birlikte */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {tumListe.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 11, color: '#333' }}>Liste boş</div>
          )}
          {[...staticItems, ...customItems].sort((a, b) => a.localeCompare(b, 'tr', { numeric: true })).map(item => {
            const isCustom = customItems.includes(item)
            return (
              <div key={item}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #111', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span onClick={() => { onSecim(item); onKapat() }}
                  style={{ fontSize: 12, color: '#c0c0c0', fontFamily: "'IBM Plex Mono',monospace", flex: 1 }}>
                  {item}
                </span>
                {isCustom
                  ? <button onClick={() => sil(item)} disabled={deleting === item}
                      style={{ background: 'transparent', border: '1px solid rgba(239,68,68,.3)', borderRadius: 4, color: '#f87171', cursor: 'pointer', padding: '3px 10px', fontSize: 10, opacity: deleting === item ? .5 : 1, flexShrink: 0 }}>
                      {deleting === item ? '…' : 'Sil'}
                    </button>
                  : <span style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.08em', flexShrink: 0 }}>SABİT</span>
                }
              </div>
            )
          })}
        </div>

        {/* Yeni ekle */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #1a1a1a', display: 'flex', gap: 8 }}>
          <input className="inp" placeholder={`Yeni ${baslik.label.toLowerCase()} ekle...`}
            value={yeni} onChange={e => setYeni(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ekle()}
            style={{ flex: 1 }} autoFocus />
          <button className="btn bA" onClick={ekle} disabled={saving} style={{ opacity: saving ? .6 : 1 }}>
            {saving ? '…' : '+ Ekle'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Ana Form ─────────────────────────────────────────────────────────────────
export default function JobForm({ job, session, canAcc, onSave, onClose,
  customCodes = {}, rawCustomCodes = {}, customKategoriler = [], customSiniflar = [] }) {

  const [yonetici, setYonetici] = useState(null) // null | 'sinif' | 'kod' | 'kategori'

  const allSiniflar = [...SINIFLAR.filter(s => s !== 'Diğer'), ...customSiniflar].sort((a, b) => a.localeCompare(b, 'tr', { numeric: true }))
  const getKodList = (s) => [...(KODLAR[s] || []), ...(customCodes[s] || [])].sort((a, b) => a.localeCompare(b, 'tr', { numeric: true }))
  const allKategoriler = [...KATEGORILER.filter(k => k !== 'Diğer'), ...customKategoriler].sort((a, b) => a.localeCompare(b, 'tr'))

  const init = () => {
    if (!job) return { ...EMPTY, siparisTarihi: today(), siparisiVeren: session.displayName }
    return { ...EMPTY, ...job }
  }

  const [f, setF] = useState(init)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const kodList = getKodList(f.sinifi)
  const ederi = parseFloat(f.birimFiyat || 0) * parseFloat(f.adedi || 0)
  const kalan = ederi - parseFloat(f.odenen || 0)

  const save = () => {
    if (!f.siparisTarihi) { alert('Sipariş tarihi giriniz.'); return }
    if (!job && !f.sinifi) { alert('Sınıf seçiniz.'); return }
    if (!job && !f.kodu) { alert('Kod seçiniz.'); return }
    const durum = f.durum
    onSave({
      ...(job ? { id: job.id } : {}),
      siparisTarihi: f.siparisTarihi, sinifi: f.sinifi, kodu: f.kodu, kategori: f.kategori,
      aciklama: f.aciklama, siparisiVeren: f.siparisiVeren,
      onayaGidisTarihi: f.onayaGidisTarihi, teslimTarihi: f.teslimTarihi, durum,
      birimFiyat: f.birimFiyat, adedi: f.adedi, odenen: f.odenen, odemeTarihi: f.odemeTarihi,
      refGorsel: f.refGorsel || '', refLink1: f.refLink1 || '', refLink2: f.refLink2 || '', refLink3: f.refLink3 || ''
    })
  }

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
  const sinifYon = {
    label: 'Sınıf',
    onAdd: addCustomSinif,
    onDelete: deleteCustomSinif
  }
  const kodYon = {
    label: 'Kod',
    onAdd: (k) => addCustomCode(f.sinifi, k),
    onDelete: (k) => deleteCustomCode(f.sinifi, k, rawCustomCodes[f.sinifi?.replace(/[.#$[\]]/g, '_')] || {})
  }
  const katYon = {
    label: 'Kategori',
    onAdd: addCustomKategori,
    onDelete: deleteCustomKategori
  }

  // Dropdown buton stili
  const dbtn = (val, placeholder) => ({
    width: '100%', background: '#111', border: '1px solid #1d1d1d', borderRadius: 4,
    padding: '7px 30px 7px 10px', color: val ? '#e0e0e0' : '#383838', fontSize: 12,
    fontFamily: "'IBM Plex Mono',monospace", display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', cursor: 'pointer', transition: 'border-color .15s', textAlign: 'left',
    outline: 'none'
  })

  const SelectBtn = ({ value, placeholder, onClick }) => (
    <button type="button" onClick={onClick} style={dbtn(value, placeholder)}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1d1d1d'}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {value || <span style={{ color: '#383838' }}>{placeholder}</span>}
      </span>
      <span style={{ color: '#999', fontSize: 10, marginLeft: 8, flexShrink: 0 }}>▾ Düzenle</span>
    </button>
  )

  return (
    <>
      <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="mbox" onClick={e => e.stopPropagation()}>
          <div className="mhd">
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', fontFamily: "'IBM Plex Sans',sans-serif" }}>{job ? 'İş Kaydını Düzenle' : 'Yeni İş Ekle'}</div>
              <div style={{ fontSize: 8, color: '#2a2a2a', marginTop: 3, letterSpacing: '0.15em' }}>ALBATUR-PAPILA İŞ TAKİP</div>
            </div>
            <button className="btn bG" style={{ fontSize: 16, padding: '3px 10px' }} onClick={onClose}>✕</button>
          </div>
          <div style={{ padding: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
              <div><Lbl c="Sipariş Tarihi" /><input className="inp" type="date" value={f.siparisTarihi} onChange={e => set('siparisTarihi', e.target.value)} /></div>
              <div><Lbl c="Siparişi Veren" /><input className="inp" value={f.siparisiVeren} onChange={e => set('siparisiVeren', e.target.value)} /></div>

              <div>
                <Lbl c="Sınıfı" />
                <SelectBtn value={f.sinifi} placeholder="Sınıf seçin / ekleyin…" onClick={() => setYonetici('sinif')} />
              </div>

              <div>
                <Lbl c="Kodu" />
                <SelectBtn
                  value={f.kodu}
                  placeholder={f.sinifi ? 'Kod seçin / ekleyin…' : 'Önce sınıf seçin…'}
                  onClick={() => f.sinifi && setYonetici('kod')} />
              </div>

              <div>
                <Lbl c="Kategori" />
                <SelectBtn value={f.kategori} placeholder="Kategori seçin / ekleyin…" onClick={() => setYonetici('kategori')} />
              </div>

              <div>
                <Lbl c="Durum" />
                <select className="inp" value={f.durum} onChange={e => set('durum', e.target.value)}>
                  <option value="beklemede">Beklemede</option>
                  <option value="uretimde">Üretimde</option>
                  <option value="onayda">Onayda</option>
                  <option value="revizyonda">Revizyonda</option>
                  <option value="tamamlandi">Tamamlandı</option>
                  <option value="kapandi">Kapandı</option>
                </select>
              </div>

              <div><Lbl c="Onaya Gidiş Tarihi" /><input className="inp" type="date" value={f.onayaGidisTarihi} onChange={e => set('onayaGidisTarihi', e.target.value)} /></div>
              <div><Lbl c="Teslim Tarihi" /><input className="inp" type="date" value={f.teslimTarihi} onChange={e => set('teslimTarihi', e.target.value)} /></div>
              <div style={{ gridColumn: '1/-1' }}>
                <Lbl c="Açıklama" />
                <textarea className="inp" rows={3} value={f.aciklama} onChange={e => set('aciklama', e.target.value)} placeholder="İş açıklaması..." style={{ resize: 'vertical' }} />
              </div>

              {/* Sipariş Referansları */}
              <div style={{ gridColumn: '1/-1' }}>
                <div style={{ margin: '4px 0 10px', paddingTop: 12, borderTop: '1px solid #141414', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 8, color: '#666', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Sipariş Referansı</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                  <div>
                    <Lbl c="Referans Görseli" />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} id="refGorselInput"
                          onChange={async e => {
                            const file = e.target.files[0]
                            if (!file) return
                            const compressed = await gorselSikistir(file)
                            set('refGorsel', compressed)
                          }} />
                        <label htmlFor="refGorselInput"
                          style={{ display: 'block', background: '#111', border: '1px dashed #2a2a2a', borderRadius: 4, padding: '8px 12px', cursor: 'pointer', fontSize: 11, color: '#555', textAlign: 'center', transition: 'border-color .15s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}>
                          {f.refGorsel ? '📎 Görsel seçildi — değiştir' : '📎 Görsel seç'}
                        </label>
                      </div>
                      {f.refGorsel && <RefThumb src={f.refGorsel} onClear={() => set('refGorsel', '')} />}
                    </div>
                  </div>
                  <div>
                    <Lbl c="Referans Linkleri" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {['refLink1', 'refLink2', 'refLink3'].map((key, i) => (
                        <div key={key} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input className="inp" value={f[key]} onChange={e => set(key, e.target.value)}
                            placeholder={`Link ${i + 1}...`} style={{ fontSize: 11, flex: 1 }} />
                          {f[key] && (
                            <a href={f[key].startsWith('http') ? f[key] : `https://${f[key]}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ flexShrink: 0, padding: '6px 10px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, color: '#888', fontSize: 11, textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'all .15s' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}>↗</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Revizyon Referansları — sadece varsa ve salt okunur göster */}
              {job && (job.revizyonGorsel || job.revizyonLink1 || job.revizyonLink2 || job.revizyonLink3 || job.revizyonNotu) && (
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ margin: '4px 0 10px', paddingTop: 12, borderTop: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 8, color: '#c084fc', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>↩ Revizyon Referansı</span>
                    <span style={{ fontSize: 9, color: '#444' }}>— salt okunur</span>
                  </div>
                  <div style={{ background: 'rgba(192,132,252,.04)', border: '1px solid rgba(192,132,252,.15)', borderRadius: 6, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                    <div>
                      {job.revizyonNotu && <>
                        <Lbl c="Revizyon Notu" />
                        <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6, marginBottom: 10, whiteSpace: 'pre-wrap' }}>{job.revizyonNotu}</div>
                      </>}
                      {job.revizyonGorsel && <>
                        <Lbl c="Revizyon Görseli" />
                        <RefThumb src={job.revizyonGorsel} onClear={null} />
                      </>}
                    </div>
                    <div>
                      {[job.revizyonLink1, job.revizyonLink2, job.revizyonLink3].filter(Boolean).length > 0 && <>
                        <Lbl c="Revizyon Linkleri" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {[job.revizyonLink1, job.revizyonLink2, job.revizyonLink3].filter(Boolean).map((l, i) => (
                            <a key={i} href={l.startsWith('http') ? l : `https://${l}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 11, color: '#c084fc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                              ↗ {l}
                            </a>
                          ))}
                        </div>
                      </>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {canAcc && <>
              <div style={{ margin: '18px 0 13px', paddingTop: 16, borderTop: '1px solid #141414' }}>
                <span style={{ fontSize: 8, color: '#d97706', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>₺ Muhasebe Bilgileri</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
                <div><Lbl c="Birim Fiyat (₺)" /><input className="inp" type="number" step=".01" value={f.birimFiyat} onChange={e => set('birimFiyat', e.target.value)} placeholder="0.00" /></div>
                <div><Lbl c="Adedi" /><input className="inp" type="number" value={f.adedi} onChange={e => set('adedi', e.target.value)} placeholder="0" /></div>
                <div><Lbl c="Ederi (Otomatik)" /><div className="inp" style={{ color: '#f59e0b', fontWeight: 500 }}>{fmt(ederi)}</div></div>
                <div><Lbl c="Ödenen (₺)" /><input className="inp" type="number" step=".01" value={f.odenen} onChange={e => set('odenen', e.target.value)} placeholder="0.00" /></div>
                <div><Lbl c="Kalan (Otomatik)" /><div className="inp" style={{ color: ederi > 0 && kalan <= 0 ? '#4ade80' : '#f87171', fontWeight: 500 }}>{fmt(kalan)}</div></div>
                <div><Lbl c="Ödeme Tarihi" /><input className="inp" type="date" value={f.odemeTarihi} onChange={e => set('odemeTarihi', e.target.value)} /></div>
              </div>
            </>}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16, borderTop: '1px solid #101010' }}>
              <button className="btn bO" onClick={onClose}>İptal</button>
              <button className="btn bA" onClick={save}>{job ? '✓ Güncelle' : '+ Ekle'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste Yöneticisi Pencereleri */}
      {yonetici === 'sinif' && (
        <ListeYoneticisi
          baslik={sinifYon}
          staticItems={SINIFLAR.filter(s => s !== 'Diğer')}
          customItems={customSiniflar}
          rawData={{}}
          onSecim={v => { set('sinifi', v); set('kodu', getKodList(v)[0] || '') }}
          onKapat={() => setYonetici(null)} />
      )}
      {yonetici === 'kod' && f.sinifi && (
        <ListeYoneticisi
          baslik={{ ...kodYon, label: `Kod (${f.sinifi})` }}
          staticItems={KODLAR[f.sinifi] || []}
          customItems={customCodes[f.sinifi] || []}
          rawData={rawCustomCodes}
          onSecim={v => set('kodu', v)}
          onKapat={() => setYonetici(null)} />
      )}
      {yonetici === 'kategori' && (
        <ListeYoneticisi
          baslik={katYon}
          staticItems={KATEGORILER.filter(k => k !== 'Diğer')}
          customItems={customKategoriler}
          rawData={{}}
          onSecim={v => set('kategori', v)}
          onKapat={() => setYonetici(null)} />
      )}
    </>
  )
}
