import React, { useState } from 'react'
import { SINIFLAR, KODLAR, KATEGORILER, fmt, today } from './constants.js'
import { Lbl } from './components.jsx'
import {
  addCustomCode, deleteCustomCode,
  addCustomKategori, deleteCustomKategori,
  addCustomSinif, deleteCustomSinif
} from './firebase.js'

const EMPTY = {
  siparisTarihi: '', sinifi: '', kodu: '', kategori: '',
  aciklama: '', siparisiVeren: '',
  onayaGidisTarihi: '', teslimTarihi: '', durum: 'beklemede',
  birimFiyat: '', adedi: '', odenen: '', odemeTarihi: ''
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
    await baslik.onAdd(k)
    setYeni('')
    setSaving(false)
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
            <div style={{ fontSize: 9, color: '#444', marginTop: 2 }}>
              Statik değerler silinemez · Özel değerler Firebase'de saklanır
            </div>
          </div>
          <button className="btn bG" style={{ fontSize: 16 }} onClick={onKapat}>✕</button>
        </div>

        {/* Liste */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* Statik değerler */}
          {staticItems.map(item => (
            <div key={item} onClick={() => { onSecim(item); onKapat() }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #111', cursor: 'pointer', transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 12, color: '#888', fontFamily: "'IBM Plex Mono',monospace" }}>{item}</span>
              <span style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.08em' }}>SABİT</span>
            </div>
          ))}

          {/* Özel değerler */}
          {customItems.length > 0 && (
            <div style={{ padding: '6px 20px 2px', fontSize: 9, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'IBM Plex Sans',sans-serif" }}>
              Özel Eklemeler
            </div>
          )}
          {customItems.map(item => (
            <div key={item}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #111', background: 'rgba(245,158,11,.03)' }}>
              <span onClick={() => { onSecim(item); onKapat() }}
                style={{ fontSize: 12, color: '#f59e0b', fontFamily: "'IBM Plex Mono',monospace", cursor: 'pointer', flex: 1 }}>
                {item}
              </span>
              <button onClick={() => sil(item)} disabled={deleting === item}
                style={{ background: 'transparent', border: '1px solid rgba(239,68,68,.3)', borderRadius: 4, color: '#f87171', cursor: 'pointer', padding: '3px 10px', fontSize: 10, opacity: deleting === item ? .5 : 1 }}>
                {deleting === item ? '…' : 'Sil'}
              </button>
            </div>
          ))}

          {staticItems.length === 0 && customItems.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 11, color: '#333' }}>Liste boş</div>
          )}
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

  const allSiniflar = [...SINIFLAR.filter(s => s !== 'Diğer'), ...customSiniflar]
  const getKodList = (s) => [...(KODLAR[s] || []), ...(customCodes[s] || [])]
  const allKategoriler = [...KATEGORILER.filter(k => k !== 'Diğer'), ...customKategoriler]

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
    if (!f.sinifi) { alert('Sınıf seçiniz.'); return }
    if (!f.kodu) { alert('Kod seçiniz.'); return }
    const durum = ederi > 0 && parseFloat(f.odenen || 0) >= ederi ? 'kapandi'
      : f.durum === 'kapandi' && parseFloat(f.odenen || 0) <= 0 ? 'tamamlandi' : f.durum
    onSave({
      ...(job ? { id: job.id } : {}),
      siparisTarihi: f.siparisTarihi, sinifi: f.sinifi, kodu: f.kodu, kategori: f.kategori,
      aciklama: f.aciklama, siparisiVeren: f.siparisiVeren,
      onayaGidisTarihi: f.onayaGidisTarihi, teslimTarihi: f.teslimTarihi, durum,
      birimFiyat: f.birimFiyat, adedi: f.adedi, odenen: f.odenen, odemeTarihi: f.odemeTarihi
    })
  }

  // Yönetici konfigürasyonları
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
      <span style={{ color: '#444', fontSize: 10, marginLeft: 8, flexShrink: 0 }}>▾ Düzenle</span>
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
