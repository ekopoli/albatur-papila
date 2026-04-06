import React, { useState } from 'react'
import { SINIFLAR, KODLAR, KATEGORILER, fmt, today } from './constants.js'
import { Dropdown, Lbl } from './components.jsx'

const EMPTY = {
  siparisTarihi: '', sinifi: '101', kodu: '101-A', kodCustom: '',
  kategori: 'A-Tipi', kategoriCustom: '', aciklama: '', siparisiVeren: '',
  onayaGidisTarihi: '', teslimTarihi: '', durum: 'beklemede',
  birimFiyat: '', adedi: '', odenen: '', odemeTarihi: ''
}

export default function JobForm({ job, session, canAcc, onSave, onClose }) {
  const init = () => {
    if (!job) return { ...EMPTY, siparisTarihi: today(), siparisiVeren: session.displayName }
    const sinifi = SINIFLAR.includes(job.sinifi) ? job.sinifi : 'Diğer'
    const kodList = KODLAR[sinifi] || []
    const kodOk = kodList.includes(job.kodu)
    const katOk = KATEGORILER.slice(0, -1).includes(job.kategori)
    return {
      ...EMPTY, ...job, sinifi,
      kodu: kodOk ? job.kodu : '__custom__',
      kodCustom: kodOk ? '' : (job.kodu || ''),
      kategori: katOk ? job.kategori : 'Diğer',
      kategoriCustom: katOk ? '' : (job.kategori || '')
    }
  }

  const [f, setF] = useState(init)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const kodList = KODLAR[f.sinifi] || []
  const isCustomKod = f.sinifi === 'Diğer' || f.kodu === '__custom__'
  const isCustomKat = f.kategori === 'Diğer'

  const setSinif = (v) => {
    const list = KODLAR[v] || []
    setF(p => ({ ...p, sinifi: v, kodu: v === 'Diğer' ? '__custom__' : (list[0] || ''), kodCustom: '' }))
  }

  const ederi = parseFloat(f.birimFiyat || 0) * parseFloat(f.adedi || 0)
  const kalan = ederi - parseFloat(f.odenen || 0)

  const save = () => {
    const kodu = isCustomKod ? f.kodCustom.trim() : f.kodu
    const kategori = isCustomKat ? f.kategoriCustom.trim() : f.kategori
    if (!f.siparisTarihi) { alert('Sipariş tarihi giriniz.'); return }
    if (!kodu) { alert('Kod giriniz.'); return }
    const durum = ederi > 0 && parseFloat(f.odenen || 0) >= ederi ? 'kapandi'
      : f.durum === 'kapandi' && parseFloat(f.odened || 0) <= 0 ? 'tamamlandi' : f.durum
    onSave({ ...(job ? { id: job.id } : {}), siparisTarihi: f.siparisTarihi, sinifi: f.sinifi, kodu, kategori, aciklama: f.aciklama, siparisiVeren: f.siparisiVeren, onayaGidisTarihi: f.onayaGidisTarihi, teslimTarihi: f.teslimTarihi, durum, birimFiyat: f.birimFiyat, adedi: f.adedi, odenen: f.odenen, odemeTarihi: f.odemeTarihi })
  }

  return (
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
              <Dropdown value={f.sinifi} options={SINIFLAR.filter(s => s !== 'Diğer')} onChange={setSinif} specialOption={{ label: 'Diğer (Manuel Giriş)', onSelect: () => setSinif('Diğer') }} />
            </div>
            <div>
              <Lbl c="Kodu" />
              {f.sinifi !== 'Diğer' && !isCustomKod
                ? <Dropdown value={f.kodu} options={kodList} onChange={v => set('kodu', v)} specialOption={{ label: 'Manuel Giriş', onSelect: () => set('kodu', '__custom__') }} />
                : f.sinifi !== 'Diğer' && isCustomKod
                  ? <div style={{ display: 'flex', gap: 6 }}>
                    <input className="inp" autoFocus placeholder="Kodu buraya yazın..." value={f.kodCustom} onChange={e => set('kodCustom', e.target.value)} style={{ flex: 1 }} />
                    <button type="button" onClick={() => set('kodu', kodList[0] || '')} style={{ background: '#1a1a1a', border: '1px solid #252525', borderRadius: 4, color: '#555', cursor: 'pointer', padding: '0 10px', fontSize: 10, flexShrink: 0 }}>↩ Liste</button>
                  </div>
                  : <input className="inp" autoFocus placeholder="Kodu buraya yazın..." value={f.kodCustom} onChange={e => set('kodCustom', e.target.value)} />
              }
            </div>
            <div>
              <Lbl c="Kategori" />
              {isCustomKat
                ? <div style={{ display: 'flex', gap: 6 }}>
                  <input className="inp" autoFocus placeholder="Kategori..." value={f.kategoriCustom} onChange={e => set('kategoriCustom', e.target.value)} style={{ flex: 1 }} />
                  <button type="button" onClick={() => set('kategori', 'A-Tipi')} style={{ background: '#1a1a1a', border: '1px solid #252525', borderRadius: 4, color: '#555', cursor: 'pointer', padding: '0 10px', fontSize: 10, flexShrink: 0 }}>↩ Liste</button>
                </div>
                : <Dropdown value={f.kategori} options={KATEGORILER.filter(k => k !== 'Diğer')} onChange={v => set('kategori', v)} specialOption={{ label: 'Diğer (Manuel Giriş)', onSelect: () => set('kategori', 'Diğer') }} />
              }
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
            <div style={{ margin: '18px 0 13px', paddingTop: 16, borderTop: '1px solid #141414', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 8, color: '#d97706', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>₺ Muhasebe Bilgileri</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
              <div><Lbl c="Birim Fiyat (₺)" /><input className="inp" type="number" step=".01" value={f.birimFiyat} onChange={e => set('birimFiyat', e.target.value)} placeholder="0.00" /></div>
              <div><Lbl c="Adedi" /><input className="inp" type="number" value={f.adedi} onChange={e => set('adedi', e.target.value)} placeholder="0" /></div>
              <div><Lbl c="Ederi (Otomatik)" /><div className="inp" style={{ color: '#f59e0b', fontWeight: 500 }}>{fmt(ederi)}</div></div>
              <div><Lbl c="Ödenen (₺)" /><input className="inp" type="number" step=".01" value={f.odened} onChange={e => set('odened', e.target.value)} placeholder="0.00" /></div>
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
  )
}
