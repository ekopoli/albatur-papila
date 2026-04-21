import React from 'react'
import { DURUM_RENK, DURUM_LABEL, fmt } from './constants.js'
import { InlineNumber } from './components.jsx'

export default function JobRow({ job, idx, canEdit, showAcc, canEditAcc, onRowClick, onUpdate, onDelete, onRevizyon, onOncelik }) {
  const durum = job.durum || 'beklemede'
  const renk = DURUM_RENK[durum] || '#c0c0c0'
  const label = DURUM_LABEL[durum] || '—'
  const ederi = parseFloat(job.birimFiyat || 0) * parseFloat(job.adedi || 0)
  const odenen = parseFloat(job.odenen || 0)
  const kalan = ederi - odenen
  const odenmis = odenen > 0

  return (
    <tr className={`tr-${durum}`} onClick={onRowClick}
      style={{ cursor: canEdit ? 'pointer' : 'default', transition: 'background .15s' }}>
      <td style={{ color: '#444', fontSize: 10, fontWeight: 600, width: 36 }}>
        {durum === 'beklemede' && canEdit
          ? <button onClick={e => { e.stopPropagation(); onOncelik && onOncelik() }}
              title={job.oncelik ? `Öncelik: ${job.oncelik} — değiştir` : 'Öncelik ata'}
              style={{ background: job.oncelik ? 'rgba(245,158,11,.2)' : '#161616', border: `1px solid ${job.oncelik ? 'rgba(245,158,11,.4)' : '#252525'}`, borderRadius: 4, color: job.oncelik ? '#f59e0b' : '#444', cursor: 'pointer', width: 24, height: 24, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Mono',monospace", transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,.5)'; e.currentTarget.style.color = '#f59e0b' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = job.oncelik ? 'rgba(245,158,11,.4)' : '#252525'; e.currentTarget.style.color = job.oncelik ? '#f59e0b' : '#444' }}>
              {job.oncelik || '·'}
            </button>
          : idx}
      </td>
      <td>{job.siparisTarihi || '—'}</td>
      <td style={{ fontWeight: 500 }}>
        {job.sinifi && job.kodu
          ? `${job.sinifi}-${job.kodu}`
          : job.kodu || job.sinifi || '—'}
      </td>
      <td>{job.kategori || '—'}</td>
      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }} title={job.aciklama}>{job.aciklama || '—'}</td>
      <td>{job.siparisiVeren || '—'}</td>
      <td>{job.onayaGidisTarihi || '—'}</td>
      <td>{job.teslimTarihi || '—'}</td>
      <td>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: renk, display: 'inline-block', flexShrink: 0 }} />
          {label}
        </span>
      </td>

      {canEdit && durum !== 'kapandi' ? (
        <td onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              onClick={e => { e.stopPropagation(); onUpdate({ durum: durum === 'tamamlandi' ? 'onayda' : 'tamamlandi' }) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 600, transition: 'all .15s', border: 'none',
                background: durum === 'tamamlandi' ? 'rgba(74,222,128,.2)' : 'rgba(74,222,128,.08)',
                color: '#4ade80',
                outline: durum === 'tamamlandi' ? '1px solid rgba(74,222,128,.5)' : '1px solid rgba(74,222,128,.2)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,.25)'; e.currentTarget.style.outline = '1px solid rgba(74,222,128,.6)' }}
              onMouseLeave={e => { e.currentTarget.style.background = durum === 'tamamlandi' ? 'rgba(74,222,128,.2)' : 'rgba(74,222,128,.08)'; e.currentTarget.style.outline = durum === 'tamamlandi' ? '1px solid rgba(74,222,128,.5)' : '1px solid rgba(74,222,128,.2)' }}>
              {durum === 'tamamlandi' ? '✓ Onaylı' : '✓ Onayla'}
            </button>
            <button
              onClick={e => { e.stopPropagation(); durum === 'revizyonda' ? onUpdate({ durum: 'onayda' }) : onRevizyon() }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 10, fontWeight: 600, transition: 'all .15s', border: 'none',
                background: durum === 'revizyonda' ? 'rgba(192,132,252,.2)' : 'rgba(192,132,252,.08)',
                color: '#c084fc',
                outline: durum === 'revizyonda' ? '1px solid rgba(192,132,252,.5)' : '1px solid rgba(192,132,252,.2)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,132,252,.25)'; e.currentTarget.style.outline = '1px solid rgba(192,132,252,.6)' }}
              onMouseLeave={e => { e.currentTarget.style.background = durum === 'revizyonda' ? 'rgba(192,132,252,.2)' : 'rgba(192,132,252,.08)'; e.currentTarget.style.outline = durum === 'revizyonda' ? '1px solid rgba(192,132,252,.5)' : '1px solid rgba(192,132,252,.2)' }}>
              {durum === 'revizyonda' ? '↩ Revizyonda' : '↩ Revizyon'}
            </button>
            <button className="btn bR" style={{ fontSize: 10 }} onClick={e => { e.stopPropagation(); onDelete() }}>Sil</button>
          </div>
        </td>
      ) : (canEdit ? <td></td> : null)}

      {showAcc && <>
        <td className="acc-sep">
          {canEditAcc
            ? <InlineNumber value={job.birimFiyat} onChange={v => onUpdate({ birimFiyat: v })} />
            : <span style={{ color: '#888' }}>{job.birimFiyat ? fmt(job.birimFiyat) : '—'}</span>}
        </td>
        <td>
          {canEditAcc
            ? <input className="inp" type="number" style={{ width: 54 }}
                key={`ad-${job.id}-${job.adedi}`}
                defaultValue={job.adedi || ''}
                placeholder="0"
                onBlur={e => onUpdate({ adedi: e.target.value })} />
            : <span style={{ color: '#888' }}>{job.adedi || '—'}</span>}
        </td>
        <td>{ederi > 0 ? fmt(ederi) : '—'}</td>
        <td>
          {canEditAcc
            ? <InlineNumber value={job.odenen} onChange={v => {
                const upd = { odenen: v }
                const val = parseFloat(v || 0)
                if (ederi > 0 && val >= ederi) upd.durum = 'kapandi'
                else if (job.durum === 'kapandi') upd.durum = 'tamamlandi'
                onUpdate(upd)
              }} />
            : <span style={{ color: '#888' }}>{job.odenen ? fmt(job.odenen) : '—'}</span>}
        </td>
        <td style={{ color: kalan <= 0 ? '#4ade80' : '#f87171', fontWeight: 500 }}>
          {(ederi > 0 || odenen > 0) ? fmt(kalan) : '—'}
        </td>
        <td>
          {canEditAcc
            ? <input className="inp" type="date" style={{ width: 118 }}
                key={`dt-${job.id}-${job.odemeTarihi}`}
                defaultValue={job.odemeTarihi || ''}
                onChange={e => onUpdate({ odemeTarihi: e.target.value })} />
            : <span style={{ color: '#888' }}>{job.odemeTarihi || '—'}</span>}
        </td>
        <td style={{ textAlign: 'center' }}>
          <input type="checkbox" checked={odenmis} readOnly style={{ width: 14, height: 14, accentColor: '#4ade80', cursor: 'default' }} />
        </td>
      </>}
    </tr>
  )
}
