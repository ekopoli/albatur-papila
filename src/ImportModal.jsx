import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { addJob } from './firebase.js'

const KOLONLAR = [
  { key: 'siparisTarihi', label: 'Sipariş Tarihi' },
  { key: 'sinifi',        label: 'Sınıfı' },
  { key: 'kodu',          label: 'Kodu' },
  { key: 'kategori',      label: 'Kategori' },
  { key: 'aciklama',      label: 'Açıklama' },
  { key: 'siparisiVeren', label: 'Siparişi Veren' },
  { key: 'onayaGidisTarihi', label: 'Onaya Gidiş Tarihi' },
  { key: 'teslimTarihi',  label: 'Teslim Tarihi' },
  { key: 'durum',         label: 'Durum' },
]

const GECERLI_DURUMLAR = ['beklemede','onayda','tamamlandi','revizyonda','kapandi']

function parseDate(val) {
  if (!val) return ''
  if (typeof val === 'number') {
    // Excel serial date
    const d = new Date(Math.round((val - 25569) * 86400 * 1000))
    return d.toISOString().slice(0, 10)
  }
  const s = String(val).trim()
  // yyyy-mm-dd veya dd.mm.yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
    const [d, m, y] = s.split('.')
    return `${y}-${m}-${d}`
  }
  return s
}

export default function ImportModal({ onClose, onDone }) {
  const [rows, setRows] = useState(null)
  const [errors, setErrors] = useState([])
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })

      const errs = []
      const parsed = raw
        .filter(r => Object.values(r).some(v => String(v).trim()))
        .map((r, i) => {
          const row = {}
          KOLONLAR.forEach(({ key, label }) => {
            const val = r[label] ?? r[key] ?? ''
            if (key.includes('Tarihi') || key === 'siparisTarihi' || key === 'teslimTarihi' || key === 'onayaGidisTarihi') {
              row[key] = parseDate(val)
            } else {
              row[key] = String(val).trim()
            }
          })
          row.durum = row.durum || 'beklemede'
          if (!GECERLI_DURUMLAR.includes(row.durum)) {
            errs.push(`Satır ${i + 2}: Geçersiz durum "${row.durum}" → "beklemede" olarak ayarlandı`)
            row.durum = 'beklemede'
          }
          return row
        })

      // Örnek satırı filtrele (Açıklama "Örnek" ile başlıyorsa)
      const filtered = parsed.filter(r => !r.aciklama.startsWith('↑'))
      setRows(filtered)
      setErrors(errs)
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    if (!rows?.length) return
    setImporting(true)
    for (const row of rows) {
      await addJob(row)
    }
    setImporting(false)
    setDone(true)
    setTimeout(() => { onDone(); onClose() }, 1200)
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mbox" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', fontFamily: "'IBM Plex Sans',sans-serif" }}>Excel'den İçe Aktar</div>
            <div style={{ fontSize: 9, color: '#444', marginTop: 2, letterSpacing: '0.1em' }}>
              .xlsx dosyasındaki siparişler Firebase'e aktarılır
            </div>
          </div>
          <button className="btn bG" style={{ fontSize: 16 }} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 22 }}>
          {/* Adım 1 — Dosya seç */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'IBM Plex Sans',sans-serif" }}>
              1 · Dosya Seç
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFile} />
              <button className="btn bO" onClick={() => inputRef.current.click()}>📂 Excel Dosyası Seç</button>
              <span style={{ fontSize: 10, color: '#333' }}>
                {rows ? `${rows.length} satır okundu` : 'Henüz dosya seçilmedi'}
              </span>
            </div>
          </div>

          {/* Uyarılar */}
          {errors.length > 0 && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 6 }}>
              {errors.map((e, i) => <div key={i} style={{ fontSize: 10, color: '#f59e0b', marginBottom: 2 }}>⚠ {e}</div>)}
            </div>
          )}

          {/* Önizleme */}
          {rows && rows.length > 0 && (
            <>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'IBM Plex Sans',sans-serif" }}>
                2 · Önizleme ({rows.length} satır)
              </div>
              <div style={{ background: '#0b0b0b', border: '1px solid #141414', borderRadius: 6, overflow: 'auto', maxHeight: 260, marginBottom: 20 }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      {KOLONLAR.map(k => <th key={k.key}>{k.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ color: '#333', fontSize: 10 }}>{i + 1}</td>
                        {KOLONLAR.map(k => (
                          <td key={k.key} style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', color: k.key === 'durum' ? '#f59e0b' : 'inherit' }}>
                            {row[k.key] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {rows && rows.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#444', fontSize: 11, marginBottom: 20 }}>
              Dosyada okunabilir satır bulunamadı.
            </div>
          )}

          {/* Butonlar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16, borderTop: '1px solid #111' }}>
            <button className="btn bO" onClick={onClose}>İptal</button>
            {rows && rows.length > 0 && (
              <button className="btn bA" onClick={handleImport} disabled={importing || done}
                style={{ opacity: importing || done ? .7 : 1 }}>
                {done ? '✓ Aktarıldı!' : importing ? `Aktarılıyor… (${rows.length} satır)` : `⬆ ${rows.length} Satırı Aktar`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
