import React, { useState, useRef, useEffect } from 'react'
import { fmt } from './constants.js'

export function InlineNumber({ value, onChange, width = 88, placeholder = '0.00' }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState('')
  const ref = useRef(null)

  const open = () => { setLocal(value || ''); setEditing(true) }
  const commit = () => { setEditing(false); onChange(local) }

  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  if (editing) return (
    <input ref={ref} className="inp" type="number" step=".01" style={{ width }}
      value={local} placeholder={placeholder}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => e.key === 'Enter' && ref.current?.blur()} />
  )
  return (
    <div onClick={open}
      style={{ cursor: 'text', minWidth: width, fontSize: 12, padding: '4px 6px', borderRadius: 4, border: '1px solid transparent', color: value ? 'inherit' : '#2a2a2a', transition: 'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#252525'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
      {value ? fmt(value) : <span style={{ color: '#2a2a2a' }}>{placeholder}</span>}
    </div>
  )
}

export function Dropdown({ value, options, onChange, placeholder = 'Seçin...', specialOption }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  const label = value === '__custom__' ? 'Manuel giriş...' : value || placeholder
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ width: '100%', background: '#111', border: `1px solid ${open ? '#f59e0b' : '#1d1d1d'}`, borderRadius: 4, padding: '7px 12px 7px 10px', color: value ? '#e0e0e0' : '#383838', fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color .15s', textAlign: 'left' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <svg width="9" height="6" viewBox="0 0 9 6" style={{ flexShrink: 0, marginLeft: 8, opacity: .4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <path d="M0 0l4.5 6L9 0z" fill="#aaa" />
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, zIndex: 500, background: '#0f0f0f', border: '1px solid #222', borderRadius: 7, boxShadow: '0 12px 32px rgba(0,0,0,.7)', overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
          {options.map(opt => {
            const sel = opt === value
            return (
              <div key={opt} onClick={() => { onChange(opt); setOpen(false) }}
                style={{ padding: '8px 12px', fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: sel ? '#f59e0b' : '#b0b0b0', background: sel ? 'rgba(245,158,11,.07)' : 'transparent', borderLeft: `2px solid ${sel ? '#f59e0b' : 'transparent'}`, transition: 'background .1s' }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}>
                {sel ? <span style={{ fontSize: 8, color: '#f59e0b' }}>✓</span> : <span style={{ width: 12 }} />}
                {opt}
              </div>
            )
          })}
          {specialOption && <>
            <div style={{ height: 1, background: '#1a1a1a', margin: '3px 0' }} />
            <div onClick={() => { specialOption.onSelect(); setOpen(false) }}
              style={{ padding: '8px 12px', fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#555', transition: 'background .1s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e0e0e0'; e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'transparent' }}>
              <span style={{ fontSize: 10 }}>✏</span>{specialOption.label}
            </div>
          </>}
        </div>
      )}
    </div>
  )
}

export function Lbl({ c }) {
  return <label className="flbl">{c}</label>
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
export function Lightbox({ src, onClose }) {
  if (!src) return null
  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', backdropFilter: 'blur(6px)' }}>
      <img src={src} alt="referans" onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 6, boxShadow: '0 20px 60px rgba(0,0,0,.8)', cursor: 'default' }} />
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }} onClick={e => e.stopPropagation()}>
        <a href={src} download="referans.jpg"
          style={{ padding: '7px 18px', borderRadius: 5, background: '#f59e0b', color: '#000', fontSize: 11, fontWeight: 600, textDecoration: 'none', fontFamily: "'IBM Plex Sans',sans-serif" }}>
          ⬇ İndir
        </a>
        <button onClick={onClose}
          style={{ padding: '7px 18px', borderRadius: 5, background: 'transparent', color: '#888', fontSize: 11, border: '1px solid #333', cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}>
          Kapat
        </button>
      </div>
    </div>
  )
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
export function RefThumb({ src, onClear }) {
  const [open, setOpen] = React.useState(false)
  if (!src) return null
  return (
    <>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img src={src} alt="ref"
          onClick={() => setOpen(true)}
          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4, border: '1px solid #2a2a2a', display: 'block', cursor: 'zoom-in', transition: 'border-color .15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'} />
        {onClear && (
          <button onClick={e => { e.stopPropagation(); onClear() }}
            style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#c0392b', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>✕</button>
        )}
      </div>
      {open && <Lightbox src={src} onClose={() => setOpen(false)} />}
    </>
  )
}
