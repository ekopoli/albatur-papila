import React, { useState } from 'react'
import { DURUM_RENK } from './constants.js'

const DURUM_LABEL = {
  beklemede:  'Beklemede',
  uretimde:   'Üretimde',
  onayda:     'Onayda',
  revizyonda: 'Revizyonda',
  tamamlandi: 'Tamamlandı',
  kapandi:    'Kapandı',
}

const DURUM_SIRA = ['beklemede', 'uretimde', 'onayda', 'revizyonda', 'tamamlandi', 'kapandi']

export default function JobRow({
  job, idx,
  canEdit, isSuperUser,
  onRowClick, onUpdate, onDelete, onRevizyon, onOncelik
}) {
  const [hover, setHover] = useState(false)

  const durum   = job.durum || 'beklemede'
  const renk    = DURUM_RENK[durum] || '#666'

  const td = {
    padding: '9px 12px',
    borderBottom: '1px solid var(--bg6)',
    fontSize: 12,
    verticalAlign: 'middle',
    color: 'var(--text2)',
    whiteSpace: 'nowrap',
  }

  const handleDurumChange = (e) => {
    e.stopPropagation()
    onUpdate({ durum: e.target.value })
  }

  return (
    <tr
      onClick={onRowClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover && canEdit ? 'var(--bg6)' : 'transparent',
        cursor: canEdit ? 'pointer' : 'default',
        transition: 'background .1s',
      }}
    >
      {/* # */}
      <td style={{ ...td, color: 'var(--text4)', fontSize: 10, textAlign: 'center', width: 36 }}>{idx}</td>

      {/* Sipariş Tarihi */}
      <td style={td}>{job.siparisTarihi || '—'}</td>

      {/* Kodu */}
      <td style={{ ...td, fontWeight: 600, color: 'var(--text)', fontFamily: "'IBM Plex Mono',monospace" }}>
        {job.kodu || job.sinifi || '—'}
      </td>

      {/* Kategori */}
      <td style={td}>{job.kategori || '—'}</td>

      {/* Açıklama */}
      <td style={{ ...td, minWidth: 160, whiteSpace: 'normal', maxWidth: 280, color: 'var(--text3)' }}>
        {job.aciklama || '—'}
      </td>

      {/* Siparişi Veren */}
      <td style={td}>{job.siparisiVeren || '—'}</td>

      {/* Onaya Gidiş */}
      <td style={{ ...td, color: 'var(--text3)' }}>{job.onayaGidisTarihi || '—'}</td>

      {/* Teslim Tarihi */}
      <td style={{ ...td, color: 'var(--text3)' }}>{job.teslimTarihi || '—'}</td>

      {/* Durum */}
      <td style={{ ...td, minWidth: 120 }} onClick={e => e.stopPropagation()}>
        {canEdit
          ? (
            <select
              value={durum}
              onChange={handleDurumChange}
              style={{
                background: 'transparent',
                border: `1px solid ${renk}44`,
                borderRadius: 4,
                color: renk,
                fontSize: 11,
                fontFamily: "'IBM Plex Mono',monospace",
                padding: '3px 6px',
                cursor: 'pointer',
                outline: 'none',
                width: '100%',
              }}
            >
              {DURUM_SIRA.map(d => (
                <option key={d} value={d}>{DURUM_LABEL[d]}</option>
              ))}
            </select>
          )
          : (
            <span style={{
              display: 'inline-block',
              padding: '3px 9px',
              borderRadius: 4,
              border: `1px solid ${renk}44`,
              color: renk,
              fontSize: 11,
            }}>
              {DURUM_LABEL[durum] || durum}
            </span>
          )
        }
      </td>

      {/* Aksiyonlar */}
      {canEdit && (
        <td style={{ ...td, textAlign: 'right', width: 128 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            {durum === 'beklemede' && (
              <button
                className="btn bO"
                title="Öncelik"
                onClick={() => onOncelik()}
                style={{ fontSize: 11, padding: '3px 8px' }}
              >↕</button>
            )}
            <button
              className="btn bO"
              title="Revizyon"
              onClick={() => onRevizyon()}
              style={{ fontSize: 11, padding: '3px 8px' }}
            >↩</button>
            {isSuperUser && (
              <button
                className="btn"
                title="Sil"
                onClick={() => onDelete()}
                style={{ fontSize: 11, padding: '3px 8px', background: 'transparent', border: '1px solid #c0392b44', color: '#f87171' }}
              >✕</button>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}
