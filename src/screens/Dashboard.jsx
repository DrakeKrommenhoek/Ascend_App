import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import { ARCHETYPES, getPetMessage } from '../data/archetypes.js'
import { useNavigate } from 'react-router-dom'
import { useIntegrations } from '../hooks/useIntegrations'

// ── Theme tokens — CSS custom properties (free/premium toggled via .premium-mode class)
const T = {
  bg:         'var(--t-bg)',
  surface:    'var(--t-surface)',
  border:     'var(--t-border)',
  borderMid:  'var(--t-border-mid)',
  navy:       'var(--t-text)',        // primary text
  navyLight:  'var(--t-text-soft)',
  secondary:  'var(--t-secondary)',
  overlay:    'var(--t-overlay)',
  accent:     'var(--t-accent)',      // active indicators & button fills
  accentText: 'var(--t-accent-text)', // text on accent backgrounds
  tableHd:    'var(--t-table-hd)',    // table header bg
  navyTint:   'var(--t-navy-tint)',   // subtle tinted bg strip
}

const CAT_COLOR = { academic: '#4F8EF7', recruiting: '#E84545', personal: '#1DAF72' }
const CAT_BG    = {
  academic:   'var(--t-cat-bg-a)',
  recruiting: 'var(--t-cat-bg-r)',
  personal:   'var(--t-cat-bg-p)',
}

// ── Calendar / event data ─────────────────────────────────────────────────────
const MARCH_GRID = [
  [1,  2,  3,  4,  5,  6,  7 ],
  [8,  9,  10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, null, null, null, null],
]
const DAY_LABELS    = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const WEEKDAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const TODAY = 17

// Each event: { label, cat, time (HH:MM 24h), duration (min), isDeadline? }
const MARCH_EVENTS = {
  // ── Week 1 (past) ──────────────────────────────────────────────────────
  2:  [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
  ],
  3:  [{ label: 'BUS 160',          cat: 'academic',   time: '14:00', duration: 60 }],
  4:  [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
  ],
  6:  [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
    { label: 'Goldman 1st Rnd',     cat: 'recruiting', time: '14:00', duration: 60 },
  ],
  // ── Week 2 (past, today = 13) ─────────────────────────────────────────
  9:  [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
    { label: 'JPM Superday',        cat: 'recruiting', time: '10:00', duration: 180 },
  ],
  10: [{ label: 'BUS 160',          cat: 'academic',   time: '14:00', duration: 60 }],
  11: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
  ],
  13: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
    { label: 'CPD Office Hours',    cat: 'recruiting', time: '14:00', duration: 45 },
  ],
  // ── Week 3 (current week) ─────────────────────────────────────────────
  16: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
    { label: 'HL First Round',      cat: 'recruiting', time: '15:00', duration: 45 },
  ],
  17: [
    { label: 'BUS 160 Team Mtg',    cat: 'academic',   time: '14:00', duration: 60 },
    { label: 'Tech Training',       cat: 'academic',   time: '19:00', duration: 90 },
  ],
  18: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'HW Superday',         cat: 'recruiting', time: '11:00', duration: 180 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
    { label: 'ECON PS Due',         cat: 'academic',   time: '23:59', duration: 0, isDeadline: true },
  ],
  19: [
    { label: 'Study Group',         cat: 'academic',   time: '13:00', duration: 90 },
    { label: 'Recruiting Debrief',  cat: 'recruiting', time: '16:00', duration: 30 },
  ],
  20: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON Midterm',        cat: 'academic',   time: '09:00', duration: 90 },
    { label: 'CPD Meeting',         cat: 'recruiting', time: '14:00', duration: 60 },
  ],
  21: [
    { label: 'Get Tux',             cat: 'personal',   time: '11:00', duration: 60 },
    { label: 'Alumni Lunch',        cat: 'personal',   time: '13:00', duration: 90 },
  ],
  // ── Week 4 ────────────────────────────────────────────────────────────
  22: [
    { label: 'Call Mom',            cat: 'personal',   time: '16:00', duration: 30 },
    { label: 'WF App Due',          cat: 'recruiting', time: '23:59', duration: 0, isDeadline: true },
  ],
  23: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
  ],
  24: [
    { label: 'BUS 160 Team Mtg',    cat: 'academic',   time: '14:00', duration: 60 },
    { label: 'HL Superday',         cat: 'recruiting', time: '10:00', duration: 180 },
  ],
  25: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
    { label: 'WB First Round',      cat: 'recruiting', time: '14:00', duration: 45 },
  ],
  26: [
    { label: 'Baird App Due',       cat: 'recruiting', time: '23:59', duration: 0, isDeadline: true },
  ],
  27: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
  ],
  // ── Week 5 ────────────────────────────────────────────────────────────
  30: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
  ],
  31: [{ label: 'BUS 160 Team Mtg', cat: 'academic',   time: '14:00', duration: 60 }],
}

// Days with conflicts (amber flag on calendar + warning in day detail)
const CONFLICT_DAYS = new Set([20])
const CONFLICT_MSG = {
  20: "Heads up — Wells Fargo deadline Sunday and ECON midterm are both this week. Your best prep window is Tuesday night.",
}

const GAME_PLAN_ITEMS_BASE = [
  { priority: 'red',    label: 'Harris Williams Superday',    detail: 'Wed Mar 18 · 11am',    cat: 'recruiting' },
  { priority: 'red',    label: 'ECON 301 midterm',            detail: 'Fri Mar 20 · 9am',     cat: 'academic'   },
  { priority: 'yellow', label: 'Wells Fargo app deadline',    detail: 'Sun Mar 22 · 11:59pm', cat: 'recruiting' },
  { priority: 'yellow', label: 'ECON 301 problem set due',    detail: 'Wed Mar 18 · 11:59pm', cat: 'academic'   },
  { priority: 'green',  label: 'Get tux for Fancy Dress',     detail: 'Sat Mar 21 · 11am',    cat: 'personal'   },
  { priority: 'green',  label: 'CPD Office Hours',            detail: 'Today · 2pm',           cat: 'recruiting' },
]
const PRIORITY_COLOR = { red: '#E84545', yellow: '#D97706', green: '#1DAF72' }
const PRIORITY_BG    = { red: 'var(--t-pri-bg-r)', yellow: 'var(--t-pri-bg-y)', green: 'var(--t-pri-bg-g)' }

const CANVAS_ASSIGNMENTS = [
  { course: 'FIN 401',  title: 'Problem Set 4',    due: 'Mar 18' },
  { course: 'ECON 301', title: 'Reading Ch. 5',    due: 'Mar 16' },
  { course: 'MKT 300',  title: 'Case Study Draft', due: 'Mar 20' },
  { course: 'CS 101',   title: 'Problem Set 3',    due: 'Mar 21' },
]
const INTEGRATIONS = [
  { name: 'Canvas',          logo: '📚' },
  { name: 'Google Calendar', logo: '📅' },
  { name: 'Outlook',         logo: '📧' },
]
const RECRUITING_ACTIVITIES = [
  { label: 'Harris Williams Superday',     date: 'Mar 18' },
  { label: 'Wells Fargo App Deadline',     date: 'Mar 22' },
  { label: 'Houlihan Lokey Superday',      date: 'Mar 24' },
  { label: 'William Blair First Round',    date: 'Mar 25' },
  { label: 'Baird App Deadline',           date: 'Mar 26' },
]
const NETWORKING_CONTACTS = [
  { name: 'Sarah Chen',               company: 'Goldman Sachs', role: 'VP Recruiting', dateMet: 'Feb 12', status: 'Thank you sent ✓',      statusColor: '#1DAF72' },
  { name: 'James Walker',             company: 'McKinsey',      role: 'Associate',     dateMet: 'Feb 8',  status: 'Follow-up pending ⚠️',  statusColor: '#D97706' },
  { name: 'Alumni (Coffee Chat)',     company: 'TBD',           role: 'TBD',           dateMet: 'Today',  status: 'Not yet contacted 🔴',  statusColor: '#E84545' },
]
const PERSONAL_TASKS = [
  { label: 'Gym Session',                 today: true  },
  { label: 'Call Mom',                    today: true  },
  { label: 'Go get tux for Fancy Dress',  today: false },
  { label: 'Grocery Shopping',            today: false },
  { label: 'Pay Bills',                   today: false },
  { label: 'Schedule Dentist Appointment', today: false },
]
const STREAK = 12
const XP_PER_TASK = 10

// ── Gap + suggestion logic ────────────────────────────────────────────────────
const TIMELINE_START = 8 * 60
const TIMELINE_END   = 22 * 60
const ROW_H = 54

function toMin(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function computeGaps(day) {
  const allEvents   = MARCH_EVENTS[day] || []
  const timedEvents = allEvents
    .filter(e => !e.isDeadline && e.duration > 0)
    .map(e => ({ start: toMin(e.time), end: toMin(e.time) + e.duration, event: e }))
    .sort((a, b) => a.start - b.start)

  const raw = []
  let cursor = TIMELINE_START
  for (const iv of timedEvents) {
    if (iv.start - cursor >= 45) raw.push({ startMin: cursor, endMin: iv.start })
    cursor = Math.max(cursor, iv.end)
  }
  if (TIMELINE_END - cursor >= 45) raw.push({ startMin: cursor, endMin: TIMELINE_END })

  const top2 = raw.sort((a, b) => (b.endMin - b.startMin) - (a.endMin - a.startMin)).slice(0, 2)

  const hasRecruiting  = allEvents.some(e => e.cat === 'recruiting')
  const nextDayHasExam = (MARCH_EVENTS[day + 1] || []).some(e =>
    e.label.toLowerCase().includes('midterm') || e.label.toLowerCase().includes('exam')
  )

  return top2.map(gap => {
    const midH = gap.startMin / 60

    // Saturday alumni lunch gap → special gold thank-you chip
    if (day === 21 && gap.startMin >= 14 * 60 + 30) {
      return {
        ...gap,
        suggestion: 'Send a thank you note before your next commitment — alumni remember who follows up.',
        isGold: true,
      }
    }

    let suggestion
    if (nextDayHasExam && midH >= 14)    suggestion = 'Review ECON 301 notes — exam is tomorrow'
    else if (hasRecruiting && midH < 14) suggestion = 'Review your Goldman Sachs prep notes'
    else if (midH >= 11 && midH < 14)    suggestion = 'Lunch break — step away from the desk'
    else if (midH < 10)                  suggestion = 'Morning focus block — no meetings until later'
    else if (midH >= 15 && midH < 18)    suggestion = "Go for a walk — you've been at it since morning"
    else                                 suggestion = 'Office hours window — good time to stop by'

    return { ...gap, suggestion, isGold: false }
  })
}

function formatHour(h) {
  if (h === 12) return '12pm'
  if (h === 0)  return '12am'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

// ── What Would You Cut (Thursday) ─────────────────────────────────────────────
function WhatWouldYouCut({ events, name }) {
  const [locks, setLocks] = useState({})
  const toggle = (i) => setLocks(p => ({ ...p, [i]: !p[i] }))

  return (
    <div style={{
      marginTop: '20px', paddingTop: '18px',
      borderTop: `1px solid ${T.border}`,
    }}>
      <p style={{
        fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
        fontWeight: 400, fontSize: 'clamp(0.9rem, 1.7vw, 1.05rem)',
        color: T.navy, margin: '0 0 14px 0',
      }}>
        Thursday is packed, {name}. What's actually non-negotiable?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.map((ev, i) => {
          const locked = locks[i] !== false && (locks[i] || true) // default locked
          const isFlexible = locks[i] === true
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px',
              backgroundColor: isFlexible ? 'var(--t-pri-bg-y)' : CAT_BG[ev.cat],
              borderRadius: '8px',
              border: `1px solid ${isFlexible ? '#FDE68A' : CAT_COLOR[ev.cat]}33`,
              transition: 'background-color 200ms ease',
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                backgroundColor: isFlexible ? '#D97706' : CAT_COLOR[ev.cat],
                flexShrink: 0, transition: 'background-color 200ms ease',
              }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 'clamp(0.8rem, 1.4vw, 0.9rem)',
                  fontWeight: 500, color: T.navy, margin: '0 0 1px 0',
                }}>
                  {ev.label}
                </p>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.65rem', color: T.secondary, margin: 0,
                }}>
                  {ev.time.replace(/^0/, '')} · {ev.duration}m
                </p>
              </div>
              <button
                onClick={() => toggle(i)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  border: `1px solid ${isFlexible ? '#FDE68A' : T.borderMid}`,
                  backgroundColor: isFlexible ? 'var(--t-pri-bg-y)' : T.surface,
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.68rem', fontWeight: 600,
                  color: isFlexible ? '#D97706' : T.navy,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {isFlexible ? '🔓 Flexible' : '🔒 Locked'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Day Detail Panel ──────────────────────────────────────────────────────────
function DayDetailPanel({ day, name, onClose }) {
  const allEvents   = MARCH_EVENTS[day] || []
  const timedEvents = allEvents.filter(e => !e.isDeadline && e.duration > 0)
  const deadlines   = allEvents.filter(e => e.isDeadline)
  const gaps        = computeGaps(day)

  const dowIndex = MARCH_GRID.flat().indexOf(day) % 7
  const dayName  = WEEKDAY_NAMES[dowIndex]

  const totalVisible = allEvents.length
  const summaryLine =
    totalVisible === 0 ? 'Open day — plenty of room to work' :
    totalVisible === 1 ? 'Light day — 1 event, lots of room' :
    totalVisible <= 3  ? `Moderate day — ${totalVisible} events` :
                         `Busy day — ${totalVisible} events`

  const HOURS = Array.from({ length: 15 }, (_, i) => i + 8)

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        backgroundColor: T.overlay,
        animation: 'fade-in 200ms ease-out forwards',
      }} />

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '86%',
        backgroundColor: T.bg,
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.10)',
        display: 'flex', flexDirection: 'column',
        animation: 'slide-up-panel 320ms cubic-bezier(0.32,0,0.2,1) forwards',
        overflow: 'hidden',
      }}>

        {/* Drag handle */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: T.borderMid }} />
        </div>

        {/* Header */}
        <div style={{ flexShrink: 0, padding: '6px 20px 12px', borderBottom: `1px solid ${T.border}` }}>
          {/* Conflict warning */}
          {CONFLICT_DAYS.has(day) && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              padding: '9px 12px', marginBottom: '10px',
              backgroundColor: 'var(--t-pri-bg-y)', borderRadius: '7px',
              border: '1px solid #FDE68A',
            }}>
              <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>⚠️</span>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.76rem',
                color: '#92400E', margin: 0, lineHeight: 1.5,
              }}>
                {CONFLICT_MSG[day]}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontWeight: 300,
                fontSize: '0.75rem', color: T.secondary, margin: '0 0 2px 0',
              }}>
                {dayName} · March {day}, 2026
              </p>
              <p style={{
                fontFamily: 'Playfair Display, serif', fontWeight: 600,
                fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
                color: T.navy, margin: '0 0 6px 0', lineHeight: 1.2,
              }}>
                {summaryLine}
              </p>
              {deadlines.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {deadlines.map((d, i) => (
                    <span key={i} style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600,
                      color: CAT_COLOR[d.cat], backgroundColor: CAT_BG[d.cat],
                      border: `1px solid ${CAT_COLOR[d.cat]}40`,
                      borderRadius: '20px', padding: '4px 12px',
                    }}>
                      ⏱ {d.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: `1px solid ${T.border}`,
              borderRadius: '50%', width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: T.secondary, fontSize: '0.9rem', flexShrink: 0,
            }}>✕</button>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 28px' }}>

          {/* Best use of your day chip */}
          <div style={{ marginBottom: '10px' }}>
            <span style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', fontWeight: 600,
              color: T.navy, backgroundColor: `${T.navy}0D`,
              border: `1px solid ${T.navy}22`,
              borderRadius: '20px', padding: '4px 12px',
              display: 'inline-block',
            }}>
              {timedEvents.length === 0
                ? '🧠 Best use of your day: deep work block'
                : timedEvents.length >= 4
                  ? '⚡ Busy day — protect your prep time'
                  : '✅ Best use of your day: stay ahead on recruiting'}
            </span>
          </div>

          <div style={{ display: 'flex' }}>

            {/* Hour labels */}
            <div style={{ width: '44px', flexShrink: 0, userSelect: 'none' }}>
              {HOURS.map(h => (
                <div key={h} style={{
                  height: `${ROW_H}px`,
                  display: 'flex', alignItems: 'flex-start', paddingTop: '4px',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: T.secondary,
                  justifyContent: 'flex-end', paddingRight: '8px',
                }}>
                  {formatHour(h)}
                </div>
              ))}
            </div>

            {/* Track */}
            <div style={{ flex: 1, position: 'relative', height: `${14 * ROW_H}px` }}>

              {HOURS.map((h, i) => (
                <div key={h} style={{
                  position: 'absolute', left: 0, right: 0, top: `${i * ROW_H}px`,
                  height: '1px', backgroundColor: T.border, zIndex: 0,
                }} />
              ))}
              {HOURS.slice(0, 14).map((_h, i) => (
                <div key={`hh-${i}`} style={{
                  position: 'absolute', left: 0, right: 0, top: `${i * ROW_H + ROW_H / 2}px`,
                  height: '1px', backgroundColor: '#F9FAFB', zIndex: 0,
                }} />
              ))}

              {/* Event blocks */}
              {timedEvents.map((ev, i) => {
                const startMin = toMin(ev.time)
                const top    = ((startMin - TIMELINE_START) / 60) * ROW_H
                const height = Math.max((ev.duration / 60) * ROW_H, 36)
                if (top < 0 || top > 14 * ROW_H) return null
                const [h, m] = ev.time.split(':').map(Number)
                const disp = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${String(m).padStart(2,'0')}${h < 12 ? 'am' : 'pm'}`
                return (
                  <div key={i} style={{
                    position: 'absolute', top: `${top}px`, left: '4px', right: 0,
                    height: `${height}px`,
                    backgroundColor: CAT_BG[ev.cat],
                    borderLeft: `3px solid ${CAT_COLOR[ev.cat]}`,
                    borderRadius: '0 6px 6px 0',
                    padding: height > 38 ? '5px 10px' : '3px 8px',
                    overflow: 'hidden', zIndex: 2,
                    boxShadow: `0 1px 3px ${CAT_COLOR[ev.cat]}22`,
                  }}>
                    <p style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 500,
                      color: CAT_COLOR[ev.cat], margin: 0, lineHeight: 1.2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ev.label}
                    </p>
                    {height > 34 && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: T.secondary, margin: '1px 0 0 0' }}>
                        {disp} · {ev.duration}m
                      </p>
                    )}
                  </div>
                )
              })}

              {/* Gap suggestion chips */}
              {gaps.map((gap, i) => {
                const midMin = (gap.startMin + gap.endMin) / 2
                const top = ((midMin - TIMELINE_START) / 60) * ROW_H - 13
                if (top < 0 || top > 14 * ROW_H) return null
                return (
                  <div key={`gap-${i}`} style={{
                    position: 'absolute', top: `${top}px`, left: '4px', right: 0, zIndex: 1,
                  }}>
                    <span style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 400,
                      color: gap.isGold ? '#92400E' : '#9CA3AF',
                      backgroundColor: gap.isGold ? '#FFFBEB' : T.bg,
                      border: `1px dashed ${gap.isGold ? '#D97706' : '#D1D5DB'}`,
                      borderRadius: '20px', padding: '3px 12px',
                      whiteSpace: 'nowrap', maxWidth: '100%',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: 'inline-block',
                    }}>
                      {gap.isGold ? '⭐' : '💡'} {gap.suggestion}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Thursday: What Would You Cut */}
          {day === 19 && (
            <WhatWouldYouCut events={timedEvents} name={name} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Week View ─────────────────────────────────────────────────────────────────
const DEMO_WEEK      = [13, 14, 15, 16, 17, 18, 19]
const DEMO_WEEK_DAYS = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed']

function WeekView({ onDayClick }) {
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px',
      }}>
        <p style={{
          fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
          fontSize: '0.82rem', color: T.navy, margin: 0, letterSpacing: '0.08em',
        }}>
          MARCH 13 – 19, 2026
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {Object.entries(CAT_COLOR).map(([cat, color]) => (
            <span key={cat} style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', color: T.secondary,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {DEMO_WEEK.map((day, idx) => {
          const events   = MARCH_EVENTS[day] || []
          const isToday  = day === TODAY
          const deadlines = events.filter(e => e.isDeadline)
          const timed    = events.filter(e => !e.isDeadline)
          const shown    = timed.slice(0, 3)
          const overflow = timed.length - shown.length + deadlines.length
          return (
            <div
              key={day}
              onClick={() => onDayClick(day)}
              style={{
                borderRadius: '8px',
                backgroundColor: isToday ? '#EEF4FF' : T.surface,
                border: `1px solid ${isToday ? '#BFDBFE' : T.border}`,
                padding: '6px 5px',
                cursor: 'pointer',
                minHeight: '110px',
                display: 'flex', flexDirection: 'column', gap: '3px',
                transition: 'background-color 120ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isToday ? '#DBEAFE' : '#EAECF0' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = isToday ? '#EEF4FF' : T.surface }}
            >
              {/* Day header */}
              <div style={{ marginBottom: '4px' }}>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.58rem',
                  color: isToday ? '#1D4ED8' : T.secondary,
                  letterSpacing: '0.06em', margin: 0, textTransform: 'uppercase',
                }}>
                  {DEMO_WEEK_DAYS[idx]}
                </p>
                <p style={{
                  fontFamily: isToday ? 'Playfair Display, serif' : 'DM Sans, sans-serif',
                  fontWeight: isToday ? 700 : 500,
                  fontSize: isToday ? '1.05rem' : '0.88rem',
                  color: isToday ? '#1D4ED8' : T.navy,
                  margin: 0, lineHeight: 1,
                }}>
                  {day}
                </p>
              </div>

              {/* Event pills */}
              {shown.map((ev, ei) => (
                <div key={ei} style={{
                  fontSize: '0.58rem',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                  color: CAT_COLOR[ev.cat],
                  backgroundColor: CAT_BG[ev.cat],
                  borderRadius: '3px', padding: '2px 4px',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {ev.label}
                </div>
              ))}

              {/* Deadline badges */}
              {deadlines.slice(0, 1).map((d, di) => (
                <div key={`d-${di}`} style={{
                  fontSize: '0.58rem',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                  color: CAT_COLOR[d.cat],
                  backgroundColor: CAT_BG[d.cat],
                  borderRadius: '3px', padding: '2px 4px',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  ⏱ {d.label}
                </div>
              ))}

              {overflow > 0 && (
                <p style={{
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.55rem',
                  color: T.secondary, margin: 0,
                }}>
                  +{overflow} more
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Calendar grid ─────────────────────────────────────────────────────────────
function CalendarGrid({ compact, onDayClick }) {
  return (
    <div style={{ minHeight: compact ? undefined : 400 }}>
      {!compact && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '8px',
        }}>
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
            fontSize: '0.82rem', color: T.navy, margin: 0, letterSpacing: '0.08em',
          }}>
            MARCH 2026
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {Object.entries(CAT_COLOR).map(([cat, color]) => (
              <span key={cat} style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', color: T.secondary,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.62rem', color: T.secondary, letterSpacing: '0.06em', padding: '3px 0',
          }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {(compact ? MARCH_GRID.slice(1, 3) : MARCH_GRID).map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {week.map((day, di) => {
              const events   = day ? (MARCH_EVENTS[day] || []) : []
              const isToday  = day === TODAY
              const isPast   = day && day < TODAY
              const hasConflict = day && CONFLICT_DAYS.has(day)
              return (
                <div
                  key={di}
                  onClick={() => day && !compact && onDayClick(day)}
                  style={{
                    minHeight: compact ? '26px' : '76px',
                    borderRadius: '5px',
                    backgroundColor: isToday ? '#EEF4FF' : T.surface,
                    border: `1px solid ${isToday ? '#BFDBFE' : T.border}`,
                    padding: compact ? '3px' : '4px 5px 3px',
                    overflow: 'hidden',
                    opacity: isPast ? 0.42 : 1,
                    cursor: day && !compact ? 'pointer' : 'default',
                    transition: 'background-color 120ms ease, border-color 120ms ease',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (day && !compact && !isPast) {
                      e.currentTarget.style.backgroundColor = isToday ? '#DBEAFE' : '#EAECF0'
                      e.currentTarget.style.borderColor = '#C5CDD9'
                    }
                  }}
                  onMouseLeave={e => {
                    if (day && !compact) {
                      e.currentTarget.style.backgroundColor = isToday ? '#EEF4FF' : T.surface
                      e.currentTarget.style.borderColor = isToday ? '#BFDBFE' : T.border
                    }
                  }}
                >
                  {day && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2px' }}>
                        {hasConflict && !compact && (
                          <span style={{ fontSize: '0.55rem', marginRight: '2px', lineHeight: 1 }}>⚠️</span>
                        )}
                        <span style={{
                          fontFamily: 'DM Sans, sans-serif', fontSize: '0.63rem',
                          fontWeight: isToday ? 700 : 400,
                          color: isToday ? '#1D4ED8' : T.secondary, lineHeight: 1,
                        }}>
                          {day}
                        </span>
                      </div>
                      {!compact && (
                        <>
                          {events.slice(0, 2).map((ev, ei) => (
                            <div key={ei} style={{
                              fontSize: '0.54rem',
                              fontFamily: 'DM Sans, sans-serif',
                              fontWeight: 600,
                              color: CAT_COLOR[ev.cat],
                              backgroundColor: CAT_BG[ev.cat],
                              borderRadius: '3px',
                              padding: '1px 4px',
                              lineHeight: 1.3,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginBottom: '1px',
                            }}>
                              {ev.isDeadline ? '⏱ ' : ''}{ev.label}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div style={{
                              fontSize: '0.5rem',
                              fontFamily: 'DM Sans, sans-serif',
                              color: T.secondary,
                              fontWeight: 500,
                              lineHeight: 1.3,
                            }}>
                              +{events.length - 2} more
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <p style={{
      fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
      fontSize: '0.66rem', color: T.secondary,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      margin: '0 0 10px 0',
    }}>
      {children}
    </p>
  )
}

function exportNetworkingXlsx() {
  const data = NETWORKING_CONTACTS.map(c => ({
    'Name':            c.name,
    'Company':         c.company,
    'Role':            c.role,
    'Date Met':        c.dateMet,
    'Follow-up Status': c.status.replace(/[🔴⚠️✓]/g, '').trim(),
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 10 }, { wch: 22 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Networking Tracker')
  XLSX.writeFile(wb, 'networking-tracker.xlsx')
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ archetypeId, name, humorStyle, onRestart }) {
  const archetype = ARCHETYPES[archetypeId] || ARCHETYPES.eagle

  const [activeTab,      setActiveTab]      = useState('master')
  const [calView,        setCalView]        = useState('week')
  const [selectedDay,    setSelectedDay]    = useState(null)
  const [syllabusState,  setSyllabusState]  = useState('idle')
  const [extraGamePlan,  setExtraGamePlan]  = useState([])
  const [personalDone,   setPersonalDone]   = useState({})
  const [xp,             setXp]             = useState(0)
  const [showPetModal,   setShowPetModal]   = useState(false)
  const [showBanner,     setShowBanner]     = useState(false)
  const [showProTooltip, setShowProTooltip] = useState(false)
  const [isPremium,      setIsPremium]      = useState(false)
  const [lockAnim,       setLockAnim]       = useState('locked') // 'locked' | 'unlocking' | 'unlocked'
  const [emailModal,     setEmailModal]     = useState(null)     // null | contact object
  const [emailText,      setEmailText]      = useState('')
  const [emailCopied,    setEmailCopied]    = useState(false)
  const lockAnimTimerRef = useRef(null)
  const bannerTimerRef = useRef(null)

  const navigate = useNavigate()
  const { integrations } = useIntegrations()
  const anyConnected = !!(integrations.google || integrations.microsoft || integrations.canvas)

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  // Pet widget message context based on real day-of-week
  const dow = new Date().getDay()
  const petContext =
    dow === 0 ? 'recruitingDeadline' :
    dow === 4 ? 'examTomorrow'       :
    dow === 6 ? 'saturday'           : 'morning'

  const petMsg = getPetMessage(archetypeId, humorStyle, petContext, name)

  function togglePremium() {
    if (isPremium) {
      clearTimeout(lockAnimTimerRef.current)
      setLockAnim('locked')
      setIsPremium(false)
    } else {
      setIsPremium(true)
      setLockAnim('unlocking')
      lockAnimTimerRef.current = setTimeout(() => setLockAnim('unlocked'), 600)
    }
  }

  function draftThankYouEmail(contact) {
    const dateClause = contact.dateMet && contact.dateMet !== 'TBD'
      ? ` on ${contact.dateMet}`
      : ''
    return `Hi ${contact.name},\n\nThank you so much for taking the time to connect with me${dateClause}. Our conversation about the opportunities at ${contact.company} was incredibly insightful, and I truly appreciated your perspective on the recruiting process.\n\nI'm very excited about the possibility of joining the team at ${contact.company}. Please don't hesitate to reach out if you need anything further from me.\n\nBest regards,\n[Your Name]`
  }

  function openEmailModal(contact) {
    setEmailText(draftThankYouEmail(contact))
    setEmailCopied(false)
    setEmailModal(contact)
  }

  function togglePersonal(idx) {
    if (personalDone[idx]) return
    const next = { ...personalDone, [idx]: true }
    setPersonalDone(next)
    setXp(prev => prev + XP_PER_TASK)
    if (Object.keys(next).length === PERSONAL_TASKS.length) {
      clearTimeout(bannerTimerRef.current)
      setShowBanner(true)
      bannerTimerRef.current = setTimeout(() => setShowBanner(false), 3500)
    }
  }
  useEffect(() => () => clearTimeout(bannerTimerRef.current), [])

  const xpPercent    = Math.min((xp / (PERSONAL_TASKS.length * XP_PER_TASK)) * 100, 100)
  const bannerMsg    = getPetMessage(archetypeId, humorStyle, 'allComplete', name)
  const progressMsg  = getPetMessage(archetypeId, humorStyle, 'progressComment', name)
  const TABS = ['master', 'canvas', 'recruiting', 'personal']

  const themeTransition = 'background-color 0.4s ease, color 0.3s ease, border-color 0.3s ease'

  return (
    <div
      className={isPremium ? 'premium-mode' : ''}
      style={{
        width: '100%', height: '100%',
        backgroundColor: T.bg,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
        animation: 'fade-in 400ms ease-out forwards',
        transition: themeTransition,
      }}
    >

      {/* ── "YOU'RE AHEAD" BANNER ──────────────────────────── */}
      {showBanner && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '12px 20px',
          backgroundColor: archetype.color,
          zIndex: 200,
          textAlign: 'center',
          animation: 'fade-in 300ms ease-out forwards',
        }}>
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
            fontSize: 'clamp(0.85rem, 1.6vw, 1rem)',
            color: '#0A0E1A', margin: 0,
          }}>
            {bannerMsg}
          </p>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(10px, 2vh, 16px) clamp(16px, 3vw, 28px)',
        borderBottom: `1px solid ${T.border}`,
        transition: themeTransition,
      }}>
        <div>
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontWeight: 300,
            fontSize: 'clamp(0.78rem, 1.4vw, 0.95rem)', color: T.secondary, margin: 0,
          }}>
            Here's your week,
          </p>
          <p style={{
            fontFamily: 'Playfair Display, serif', fontWeight: 600,
            fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)', color: T.navy, margin: 0, lineHeight: 1.2,
          }}>
            {name}.
          </p>
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem',
            color: T.secondary, margin: '4px 0 0 0', opacity: 0.65,
            letterSpacing: '0.02em',
          }}>
            Week of March 17 · Game plan active
          </p>
        </div>

        {/* Right-side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => navigate('/settings')}
          style={{
            background: 'none',
            border: '1px solid var(--t-border, rgba(0,0,0,0.12))',
            borderRadius: '8px',
            padding: '6px 14px',
            cursor: 'pointer',
            color: 'var(--t-text)',
            fontSize: '13px',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ⚙️ Settings
        </button>
        {/* Pet widget */}
        <button
          onClick={() => setShowPetModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: isPremium ? 'rgba(245,158,11,0.08)' : `${archetype.color}12`,
            border: isPremium ? '1px solid rgba(245,158,11,0.25)' : `1px solid ${archetype.color}40`,
            borderLeft: isPremium ? '4px solid #F59E0B' : `1px solid ${archetype.color}40`,
            borderRadius: '10px', padding: '8px 12px',
            cursor: 'pointer',
            transition: `background-color 0.4s ease, border-color 0.4s ease`,
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = isPremium ? 'rgba(245,158,11,0.14)' : `${archetype.color}20` }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = isPremium ? 'rgba(245,158,11,0.08)' : `${archetype.color}12` }}
        >
          <div style={{ position: 'relative' }}>
            <img src={archetype.image} alt={archetype.animal}
              style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
            <span style={{
              position: 'absolute', top: '-6px', right: '-8px',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.56rem', fontWeight: 700,
              backgroundColor: '#E84545', color: 'white',
              borderRadius: '8px', padding: '1px 5px', lineHeight: 1.4,
            }}>
              {STREAK}🔥
            </span>
          </div>
          <div style={{ minWidth: '60px' }}>
            <p style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem',
              color: archetype.color, fontWeight: 600, margin: '0 0 3px 0', whiteSpace: 'nowrap',
            }}>
              Your {archetype.animal}
            </p>
            <div style={{ height: '3px', backgroundColor: T.border, borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${xpPercent}%`,
                backgroundColor: archetype.color, transition: 'width 400ms ease-out',
              }} />
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.55rem', color: T.secondary, margin: '2px 0 0 0' }}>
              {xp} XP
            </p>
          </div>
        </button>
        </div>
      </div>

      {/* ── FREE / PREMIUM TOGGLE ───────────────────────────── */}
      <div style={{
        flexShrink: 0, display: 'flex', justifyContent: 'center',
        padding: '8px 0 6px',
        borderBottom: `1px solid ${T.border}`,
        transition: themeTransition,
      }}>
        <div
          onClick={togglePremium}
          style={{
            position: 'relative',
            display: 'flex', alignItems: 'center',
            width: '196px', height: '30px',
            backgroundColor: T.surface,
            border: isPremium ? '1px solid rgba(245,158,11,0.4)' : `1px solid ${T.borderMid}`,
            borderRadius: '15px',
            cursor: 'pointer',
            userSelect: 'none',
            boxShadow: isPremium ? '0 0 0 2px rgba(245,158,11,0.15)' : 'none',
            transition: 'background-color 0.4s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          {/* Sliding pill */}
          <div style={{
            position: 'absolute',
            left: '3px',
            width: 'calc(50% - 3px)',
            height: 'calc(100% - 6px)',
            backgroundColor: isPremium ? '#F59E0B' : 'white',
            borderRadius: '12px',
            boxShadow: isPremium ? '0 1px 6px rgba(245,158,11,0.4)' : '0 1px 4px rgba(0,0,0,0.12)',
            transform: isPremium ? 'translateX(100%)' : 'translateX(0)',
            transition: 'transform 200ms ease, background-color 0.3s ease, box-shadow 0.3s ease',
          }} />
          {/* Labels */}
          <span style={{
            position: 'relative', zIndex: 1,
            flex: 1, textAlign: 'center',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.72rem', fontWeight: 600,
            color: !isPremium ? T.accent : T.secondary,
            transition: 'color 200ms ease',
          }}>
            Free
          </span>
          <span style={{
            position: 'relative', zIndex: 1,
            flex: 1, textAlign: 'center',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.72rem', fontWeight: 600,
            color: isPremium ? '#0D1B3E' : T.secondary,
            transition: 'color 200ms ease',
          }}>
            Premium
          </span>
        </div>
      </div>

      {/* ── TAB BAR ─────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, display: 'flex', position: 'relative',
        borderBottom: `1px solid ${T.border}`,
        padding: `0 clamp(16px, 3vw, 28px)`,
        transition: themeTransition,
      }}>
        {TABS.map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? `2px solid ${T.accent}` : '2px solid transparent',
              color: activeTab === tab ? T.accent : T.secondary,
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
              fontSize: 'clamp(0.78rem, 1.4vw, 0.88rem)', letterSpacing: '0.03em',
              padding: 'clamp(8px, 1.5vh, 12px) clamp(12px, 2vw, 20px)',
              cursor: 'pointer', textTransform: 'capitalize',
              transition: `background-color 0.4s ease, color 150ms ease, border-color 150ms ease`,
              marginBottom: '-1px',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            {tab === 'recruiting' ? (
              <>
                <span style={{
                  color: isPremium ? '#D97706' : 'inherit',
                  transition: 'color 300ms ease',
                }}>
                  Recruiting
                </span>
                {lockAnim !== 'unlocked' && (
                  <span style={{
                    fontSize: '0.6rem',
                    display: 'inline-block',
                    opacity: lockAnim === 'unlocking' ? 0 : 1,
                    transform: lockAnim === 'unlocking' ? 'scale(1.3)' : 'scale(1)',
                    transition: 'opacity 500ms ease, transform 500ms ease',
                  }}>
                    {lockAnim === 'unlocking' ? '🔓' : '🔒'}
                  </span>
                )}
                {!isPremium && (
                  <span style={{
                    fontSize: '0.5rem', fontWeight: 700,
                    backgroundColor: T.accent, color: T.accentText,
                    borderRadius: '3px', padding: '1px 4px', lineHeight: 1.5,
                    transition: themeTransition,
                  }}>
                    PRO
                  </span>
                )}
              </>
            ) : tab}
          </button>
        ))}
        {showProTooltip && (
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: T.accent, color: T.accentText,
            borderRadius: '8px', padding: '8px 16px',
            fontSize: '0.72rem', fontFamily: 'DM Sans, sans-serif',
            whiteSpace: 'nowrap', zIndex: 100, marginTop: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          }}>
            Recruiting intelligence is an Ascend Pro feature.
          </div>
        )}
      </div>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', transition: themeTransition }}>

        {/* ── MASTER ──────────────────────────────────────── */}
        {activeTab === 'master' && (
          <div style={{
            height: '100%', overflowY: 'auto',
            padding: 'clamp(12px, 2vh, 18px) clamp(16px, 3vw, 28px)',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>

            {/* ── GAME PLAN (always visible, top priority) ──────── */}
            <div style={{
              flexShrink: 0,
              backgroundColor: T.surface, borderRadius: '10px',
              border: `1px solid ${T.border}`,
              padding: 'clamp(12px, 2vh, 16px) clamp(14px, 2.5vw, 20px)',
            }}>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                fontSize: '0.66rem', color: T.navy,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                margin: '0 0 2px 0',
              }}>
                Your Game Plan
              </p>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontWeight: 300,
                fontSize: '0.72rem', color: T.secondary,
                margin: '0 0 12px 0', lineHeight: 1.4,
              }}>
                Your academics, recruiting, and life — coordinated into one weekly plan.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[...GAME_PLAN_ITEMS_BASE, ...extraGamePlan].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0',
                    backgroundColor: PRIORITY_BG[item.priority],
                    borderRadius: '7px',
                    border: `1px solid ${PRIORITY_COLOR[item.priority]}25`,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: '3px', alignSelf: 'stretch', flexShrink: 0,
                      backgroundColor: PRIORITY_COLOR[item.priority],
                    }} />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(0.8rem, 1.45vw, 0.9rem)', color: T.navy, margin: '0 0 1px 0', fontWeight: 500 }}>{item.label}</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.66rem', color: T.secondary, margin: 0 }}>{item.detail}</p>
                      </div>
                      {item.isNew && (
                        <span style={{
                          fontFamily: 'DM Sans, sans-serif', fontSize: '0.58rem', fontWeight: 700,
                          backgroundColor: CAT_COLOR.academic, color: 'white',
                          borderRadius: '4px', padding: '2px 6px', flexShrink: 0,
                        }}>New</span>
                      )}
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: CAT_COLOR[item.cat] || T.secondary,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RECRUITING SIGNAL STRIP ───────────────────────── */}
            <div style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px',
              backgroundColor: T.navyTint,
              borderRadius: '7px',
              border: `1px solid ${T.border}`,
              transition: themeTransition,
            }}>
              <span style={{ fontSize: '0.8rem', flexShrink: 0 }}>⚡</span>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.73rem',
                color: T.navy, margin: 0, lineHeight: 1.4,
              }}>
                <strong>4 active processes this month</strong> · Next: Harris Williams Superday Wed 11am
              </p>
            </div>

            {/* ── CALENDAR ──────────────────────────────────────── */}
            <div style={{ flexShrink: 0 }}>
              {/* Segmented toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '10px',
              }}>
                <div style={{
                  display: 'inline-flex',
                  backgroundColor: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: '8px',
                  padding: '3px',
                  gap: '2px',
                }}>
                  {['Day', 'Week', 'Month'].map(v => (
                    <button key={v}
                      onClick={() => {
                        const next = v.toLowerCase()
                        setCalView(next)
                        if (next === 'day' && !selectedDay) setSelectedDay(TODAY)
                      }}
                      style={{
                        background: calView === v.toLowerCase() ? T.accent : 'transparent',
                        color: calView === v.toLowerCase() ? T.accentText : T.secondary,
                        border: 'none', borderRadius: '5px',
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600, fontSize: '0.72rem',
                        padding: '5px 14px', cursor: 'pointer',
                        transition: 'background 150ms ease, color 150ms ease',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Views */}
              {calView === 'week' && (
                <WeekView onDayClick={(d) => { setSelectedDay(d); }} />
              )}
              {calView === 'month' && (
                <CalendarGrid compact={false} onDayClick={setSelectedDay} />
              )}
              {calView === 'day' && (() => {
                const activeDay = selectedDay || TODAY
                const activeDayData = (MARCH_EVENTS[activeDay] || []).filter(e => !e.isDeadline && e.duration > 0)
                const activeDayDeadlines = (MARCH_EVENTS[activeDay] || []).filter(e => e.isDeadline)
                if (!MARCH_EVENTS) {
                  return <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.secondary, padding: '14px' }}>No events scheduled for this day yet.</div>
                }
                return (
                  <div style={{
                    backgroundColor: T.surface, borderRadius: '10px',
                    border: `1px solid ${T.border}`,
                    padding: '14px 16px',
                    maxHeight: '340px', overflowY: 'auto',
                  }}>
                    <p style={{
                      fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                      fontSize: '0.7rem', color: T.navy,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      margin: '0 0 10px 0',
                    }}>
                      March {activeDay}
                    </p>
                    {activeDayDeadlines.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {activeDayDeadlines.map((d, i) => (
                          <span key={i} style={{
                            fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600,
                            color: CAT_COLOR[d.cat], backgroundColor: CAT_BG[d.cat],
                            border: `1px solid ${CAT_COLOR[d.cat]}40`,
                            borderRadius: '20px', padding: '4px 12px',
                          }}>⏱ {d.label}</span>
                        ))}
                      </div>
                    )}
                    {activeDayData.length === 0 ? (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.secondary, margin: 0 }}>
                        Nothing scheduled — a good day to get ahead.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {activeDayData.map((ev, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            padding: '8px 10px',
                            backgroundColor: T.bg, borderRadius: '7px',
                            borderLeft: `3px solid ${CAT_COLOR[ev.cat] || T.navy}`,
                            minHeight: '36px',
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                                fontSize: '0.82rem', color: T.navy, margin: '0 0 2px 0',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>{ev.label}</p>
                              {ev.time && (
                                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: T.secondary, margin: 0 }}>
                                  {ev.time}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

            {/* ── CALENDAR EMPTY STATE ──────────────────────────── */}
            {!anyConnected && (
              <div style={{
                margin: '1rem 0',
                padding: '0.75rem 1rem',
                background: 'var(--t-surface)',
                borderRadius: '10px',
                border: '1px dashed var(--t-accent)',
                fontSize: '13px',
                color: 'var(--t-text-muted, var(--t-text))',
                opacity: 0.75,
                textAlign: 'center',
              }}>
                📅 Connect Google Calendar, Outlook, or Canvas in{' '}
                <button
                  onClick={() => navigate('/settings')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-accent)', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}
                >
                  Settings
                </button>{' '}
                to see your real events here.
              </div>
            )}
            </div>

            {/* ── PROGRESS SNAPSHOT ─────────────────────────────── */}
            <div style={{
              flexShrink: 0,
              backgroundColor: T.surface, borderRadius: '10px',
              border: `1px solid ${T.border}`,
              padding: 'clamp(12px, 2vh, 16px) clamp(14px, 2.5vw, 20px)',
            }}>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                fontSize: '0.7rem', color: T.navy,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                margin: '0 0 10px 0',
              }}>
                Your momentum, {name}.
              </p>
              <div style={{ display: 'flex', gap: 'clamp(16px, 4vw, 32px)', marginBottom: '10px' }}>
                {[
                  { label: 'Last week', value: '4 of 7', sub: 'tasks completed' },
                  { label: 'This week',  value: '6 of 7', sub: 'on track' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', color: T.secondary, margin: '0 0 2px 0', letterSpacing: '0.06em' }}>{stat.label}</p>
                    <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: T.navy, margin: '0 0 1px 0' }}>{stat.value}</p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', color: T.secondary, margin: 0 }}>{stat.sub}</p>
                  </div>
                ))}
              </div>
              {progressMsg && (
                <p style={{
                  fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
                  fontWeight: 400, fontSize: 'clamp(0.78rem, 1.4vw, 0.9rem)',
                  color: T.secondary, margin: 0, lineHeight: 1.55,
                  borderTop: `1px solid ${T.border}`, paddingTop: '8px',
                }}>
                  "{progressMsg}"
                </p>
              )}
            </div>

            {/* B2B footer */}
            <p style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem',
              fontStyle: 'italic', color: T.secondary,
              textAlign: 'center', padding: '4px 0 8px',
              margin: 0, opacity: 0.55,
            }}>
              Built for career centers. Inquire at ascend.app/partners
            </p>
          </div>
        )}

        {/* ── CANVAS ──────────────────────────────────────── */}
        {activeTab === 'canvas' && (
          <div style={{
            height: '100%', overflowY: 'auto',
            padding: 'clamp(12px, 2vh, 18px) clamp(16px, 3vw, 28px)',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            <div>
              <Label>Connected</Label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {INTEGRATIONS.map(int => (
                  <div key={int.name} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 14px', backgroundColor: T.surface,
                    borderRadius: '8px', border: `1px solid ${T.border}`,
                  }}>
                    <span style={{ fontSize: '1rem' }}>{int.logo}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.navy }}>{int.name}</span>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1DAF72' }} />
                  </div>
                ))}
              </div>
            </div>
            {/* ── SYLLABUS UPLOAD ────────────────────────────── */}
            {syllabusState === 'idle' && (
              <div style={{
                border: `1.5px dashed ${T.border}`,
                borderRadius: '10px', padding: '18px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '8px', cursor: 'pointer', backgroundColor: T.surface,
                transition: 'border-color 150ms ease',
              }}
                onClick={() => {
                  setSyllabusState('uploading')
                  setTimeout(() => setSyllabusState('parsing'), 800)
                  setTimeout(() => setSyllabusState('results'), 2000)
                }}
              >
                <span style={{ fontSize: '1.6rem' }}>📄</span>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: T.navy, margin: 0, textAlign: 'center' }}>
                  Upload Syllabus
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: T.secondary, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                  Upload a syllabus PDF and Ascend extracts every deadline automatically.
                </p>
              </div>
            )}
            {syllabusState === 'uploading' && (
              <div style={{ backgroundColor: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '18px 20px' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.navy, margin: '0 0 10px 0', fontWeight: 600 }}>
                  Uploading FIN 401 syllabus...
                </p>
                <div style={{ height: '6px', backgroundColor: T.border, borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', backgroundColor: T.accent,
                    borderRadius: '3px', width: '70%',
                    animation: 'progress-fill 800ms ease-out forwards',
                  }} />
                </div>
              </div>
            )}
            {syllabusState === 'parsing' && (
              <div style={{
                backgroundColor: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`,
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: `2.5px solid ${T.navy}`, borderTopColor: 'transparent',
                  flexShrink: 0,
                  animation: 'spin 700ms linear infinite',
                }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: T.navy, margin: 0 }}>
                  Extracting assignments from FIN 401 syllabus...
                </p>
              </div>
            )}
            {syllabusState === 'results' && (
              <div style={{ backgroundColor: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, padding: '16px 18px' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: T.navy, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                  Found in FIN 401 Syllabus
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { course: 'FIN 401', title: 'DCF Analysis Assignment', due: 'Mar 28' },
                    { course: 'FIN 401', title: 'Midterm Exam',            due: 'Apr 4'  },
                    { course: 'FIN 401', title: 'Case Study Presentation', due: 'Apr 18' },
                    { course: 'FIN 401', title: 'Final Paper',             due: 'May 2'  },
                  ].map((a, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '8px 12px', backgroundColor: T.bg,
                      borderRadius: '7px', border: `1px solid ${T.border}`,
                      borderLeft: `3px solid ${CAT_COLOR.academic}`,
                    }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: CAT_COLOR.academic, minWidth: '52px', flexShrink: 0 }}>{a.course}</span>
                      <span style={{ flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.navy }}>{a.title}</span>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.secondary, flexShrink: 0 }}>Due {a.due}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSyllabusState('added')
                    setExtraGamePlan(prev => [
                      ...prev,
                      { priority: 'yellow', label: 'FIN 401 DCF Analysis Assignment', detail: 'Due Mar 28', cat: 'academic', isNew: true },
                    ])
                  }}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px',
                    backgroundColor: T.accent, color: T.accentText, border: 'none',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.82rem',
                    cursor: 'pointer', letterSpacing: '0.03em',
                  }}
                >
                  Add All to Ascend
                </button>
              </div>
            )}
            {syllabusState === 'added' && (
              <div style={{
                backgroundColor: '#F0FDF4', borderRadius: '10px',
                border: '1px solid #BBF7D0', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ fontSize: '1rem' }}>✅</span>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: '#15803D', margin: 0, fontWeight: 600 }}>
                  4 FIN 401 deadlines added to your calendar and game plan.
                </p>
              </div>
            )}

            <div>
              <Label>Upcoming Assignments</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {[...CANVAS_ASSIGNMENTS, ...(syllabusState === 'added' ? [
                  { course: 'FIN 401', title: 'DCF Analysis Assignment', due: 'Mar 28' },
                  { course: 'FIN 401', title: 'Midterm Exam',            due: 'Apr 4'  },
                  { course: 'FIN 401', title: 'Case Study Presentation', due: 'Apr 18' },
                  { course: 'FIN 401', title: 'Final Paper',             due: 'May 2'  },
                ] : [])].map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: 'clamp(10px, 1.8vh, 14px) clamp(14px, 2.5vw, 18px)',
                    backgroundColor: T.surface, borderRadius: '8px', border: `1px solid ${T.border}`,
                  }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: CAT_COLOR.academic, minWidth: '56px', flexShrink: 0 }}>{a.course}</span>
                    <span style={{ flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(0.82rem, 1.5vw, 0.92rem)', color: T.navy }}>{a.title}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: T.secondary, flexShrink: 0 }}>Due {a.due}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RECRUITING ──────────────────────────────────── */}
        {activeTab === 'recruiting' && (
          <div style={{ height: '100%', position: 'relative' }}>

          {/* Pro blur overlay — only in Free mode */}
          {!isPremium && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 50,
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(255,255,255,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              border: `1px solid ${T.border}`,
              boxShadow: '0 8px 32px rgba(27,58,107,0.12)',
              padding: '28px 36px',
              textAlign: 'center',
              maxWidth: '320px',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>🔒</div>
              <p style={{
                fontFamily: 'Playfair Display, serif', fontWeight: 600,
                fontSize: '1.1rem', color: T.navy, margin: '0 0 6px 0',
              }}>
                Ascend Pro
              </p>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem',
                color: T.secondary, margin: '0 0 18px 0', lineHeight: 1.55,
              }}>
                Full recruiting intelligence — pipeline tracking, networking CRM, and firm-specific deadline alerts.
              </p>
              <div
                onClick={togglePremium}
                style={{
                  display: 'inline-block',
                  backgroundColor: T.accent, color: T.accentText,
                  borderRadius: '8px', padding: '8px 20px',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600,
                  letterSpacing: '0.03em', cursor: 'pointer',
                }}
              >
                Upgrade to Premium ↗
              </div>
            </div>
          </div>
          )}

          <div style={{
            height: '100%', overflowY: 'auto',
            padding: 'clamp(12px, 2vh, 18px) clamp(16px, 3vw, 28px)',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            <div>
              <Label>Pipeline</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {RECRUITING_ACTIVITIES.map((act, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: 'clamp(10px, 1.8vh, 14px) clamp(14px, 2.5vw, 18px)',
                    backgroundColor: T.surface, borderRadius: '8px', border: `1px solid ${T.border}`,
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: CAT_COLOR.recruiting, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(0.82rem, 1.5vw, 0.92rem)', color: T.navy }}>{act.label}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: T.secondary, flexShrink: 0 }}>{act.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Networking tracker */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Label>Networking Tracker</Label>
                <button
                  onClick={exportNetworkingXlsx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px',
                    backgroundColor: '#217346', borderRadius: '6px',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem',
                    fontWeight: 600, color: 'white',
                    transition: 'opacity 150ms ease',
                    marginBottom: '10px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  <span>⬇</span> Export Tracker
                </button>
              </div>
              <div style={{
                backgroundColor: T.surface, borderRadius: '10px',
                border: `1px solid ${T.border}`,
                overflow: 'hidden',
              }}>
                {/* Table header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 1.2fr 0.8fr 1.4fr 1fr',
                  padding: '8px 14px',
                  backgroundColor: T.tableHd,
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  {['Name', 'Company', 'Role', 'Date Met', 'Follow-up', ''].map(h => (
                    <span key={h} style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem',
                      fontWeight: 700, color: T.secondary, letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                      {h}
                    </span>
                  ))}
                </div>
                {NETWORKING_CONTACTS.map((c, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 1.2fr 0.8fr 1.4fr 1fr',
                    padding: 'clamp(9px, 1.6vh, 13px) 14px',
                    borderBottom: i < NETWORKING_CONTACTS.length - 1 ? `1px solid ${T.border}` : 'none',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: T.navy, fontWeight: 500 }}>{c.name}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.secondary }}>{c.company}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.secondary }}>{c.role}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: T.secondary }}>{c.dateMet}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: c.statusColor, fontWeight: 500 }}>{c.status}</span>
                    <button
                      onClick={() => openEmailModal(c)}
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.64rem', fontWeight: 500,
                        color: T.navy, cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.border }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.surface }}
                    >
                      ✉ Draft Thanks
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* ── PERSONAL ────────────────────────────────────── */}
        {activeTab === 'personal' && (
          <div style={{
            height: '100%', overflowY: 'auto',
            padding: 'clamp(12px, 2vh, 18px) clamp(16px, 3vw, 28px)',
          }}>
            <Label>Life Admin</Label>
            <p style={{
              fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic',
              fontWeight: 300, fontSize: 'clamp(0.82rem, 1.4vw, 0.92rem)',
              color: T.secondary, margin: '0 0 14px 0', lineHeight: 1.5,
            }}>
              Things to handle this week, {name}.
            </p>
            {['today', 'week'].map(group => {
              const tasks = PERSONAL_TASKS
                .map((t, i) => ({ ...t, i }))
                .filter(t => group === 'today' ? t.today : !t.today)
              if (tasks.length === 0) return null
              return (
                <div key={group} style={{ marginBottom: '14px' }}>
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                    fontSize: '0.6rem', color: T.secondary,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    margin: '0 0 7px 0',
                  }}>
                    {group === 'today' ? 'Today' : 'This Week'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {tasks.map(({ label: task, i }) => {
                      const done = !!personalDone[i]
                      const taskMsg = done ? getPetMessage(archetypeId, humorStyle, 'taskComplete', name) : null
                      return (
                        <div key={i} onClick={() => togglePersonal(i)} style={{
                          display: 'flex', flexDirection: 'column',
                          padding: 'clamp(11px, 2vh, 15px) clamp(14px, 2.5vw, 18px)',
                          backgroundColor: done ? '#F0FDF4' : T.surface,
                          borderRadius: '8px',
                          border: `1px solid ${done ? '#BBF7D0' : T.border}`,
                          cursor: done ? 'default' : 'pointer',
                          opacity: done ? 0.65 : 1,
                          transition: 'opacity 250ms ease, background-color 200ms ease',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '18px', height: '18px', flexShrink: 0, borderRadius: '4px',
                              border: `2px solid ${done ? CAT_COLOR.personal : T.borderMid}`,
                              backgroundColor: done ? CAT_COLOR.personal : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 200ms ease',
                            }}>
                              {done && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <span style={{
                              flex: 1, fontFamily: 'DM Sans, sans-serif',
                              fontSize: 'clamp(0.88rem, 1.6vw, 1rem)', color: T.navy,
                              textDecoration: done ? 'line-through' : 'none',
                            }}>
                              {task}
                            </span>
                            {done && (
                              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: CAT_COLOR.personal, fontWeight: 600, flexShrink: 0 }}>
                                +{XP_PER_TASK} XP
                              </span>
                            )}
                          </div>
                          {done && taskMsg && (
                            <p style={{
                              fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic',
                              fontSize: '0.72rem', color: CAT_COLOR.personal,
                              margin: '6px 0 0 30px', lineHeight: 1.4,
                              animation: 'fade-in 300ms ease-out forwards',
                            }}>
                              {taskMsg}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Day detail panel */}
        {selectedDay !== null && (
          <DayDetailPanel day={selectedDay} name={name} onClose={() => setSelectedDay(null)} />
        )}
      </div>

      {/* ── RESTART ─────────────────────────────────────────── */}
      <button
        onClick={onRestart}
        style={{
          position: 'absolute', bottom: 'clamp(8px, 1.5vh, 14px)', left: 'clamp(12px, 2vw, 20px)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem',
          color: T.secondary, opacity: 0.3, letterSpacing: '0.04em', padding: '4px',
          transition: 'opacity 200ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '0.3' }}
      >
        ↺ Restart Demo
      </button>

      {/* ── PET MODAL ───────────────────────────────────────── */}
      {/* ── THANK-YOU EMAIL MODAL ───────────────────────────── */}
      {emailModal && (
        <div
          onClick={() => setEmailModal(null)}
          style={{
            position: 'absolute', inset: 0, backgroundColor: T.overlay,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, animation: 'fade-in 200ms ease-out forwards',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: T.bg, border: `1px solid ${T.border}`,
              borderRadius: '14px', padding: 'clamp(20px, 4vw, 28px)',
              maxWidth: '480px', width: '92%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              animation: 'slide-up-fade 300ms ease-out forwards',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{
                fontFamily: 'Playfair Display, serif', fontWeight: 600,
                fontSize: '1.05rem', color: T.navy, margin: 0,
              }}>
                ✉ Draft Thank-You Email
              </p>
              <button
                onClick={() => setEmailModal(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '1rem', color: T.secondary, lineHeight: 1,
                  padding: '2px 6px',
                }}
              >
                ✕
              </button>
            </div>
            {/* Sub-label */}
            <p style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.76rem',
              color: T.secondary, margin: 0,
            }}>
              To: <strong style={{ color: T.navy }}>{emailModal.name}</strong> · {emailModal.company}
            </p>
            {/* Editable textarea */}
            <textarea
              value={emailText}
              onChange={e => { setEmailText(e.target.value); setEmailCopied(false) }}
              rows={9}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
                color: T.navy, lineHeight: 1.6,
                border: `1px solid ${T.borderMid}`, borderRadius: '8px',
                padding: '10px 12px', resize: 'vertical',
                outline: 'none', backgroundColor: T.surface,
              }}
            />
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEmailModal(null)}
                style={{
                  background: 'none', border: `1px solid ${T.borderMid}`,
                  borderRadius: '6px', padding: '7px 18px',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem',
                  color: T.secondary, cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(emailText).catch(() => {})
                  setEmailCopied(true)
                  setTimeout(() => setEmailCopied(false), 2000)
                }}
                style={{
                  backgroundColor: emailCopied ? '#1DAF72' : T.accent,
                  border: 'none', borderRadius: '6px', padding: '7px 18px',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem',
                  fontWeight: 600, color: emailCopied ? 'white' : T.accentText, cursor: 'pointer',
                  transition: 'background-color 200ms ease, color 200ms ease',
                }}
              >
                {emailCopied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PET MODAL ───────────────────────────────────────── */}
      {showPetModal && (
        <div
          onClick={() => setShowPetModal(false)}
          style={{
            position: 'absolute', inset: 0, backgroundColor: T.overlay,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, animation: 'fade-in 200ms ease-out forwards',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: T.bg, border: `1px solid ${T.border}`,
              borderRadius: '14px', padding: 'clamp(20px, 4vw, 32px)',
              maxWidth: '400px', width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              animation: 'slide-up-fade 300ms ease-out forwards',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <img src={archetype.image} alt="" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.76rem', color: archetype.color, fontWeight: 600, margin: 0 }}>Your {archetype.animal}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.63rem', color: T.secondary, margin: 0 }}>Day {STREAK} · {xp} XP</p>
              </div>
            </div>
            <p style={{
              fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.04rem)',
              color: T.navy, lineHeight: 1.65, margin: '0 0 16px 0',
            }}>
              "{petMsg || 'Check your dashboard. Something needs your attention.'}"
            </p>
            <button
              onClick={() => setShowPetModal(false)}
              style={{
                background: 'none', border: `1px solid ${T.borderMid}`,
                borderRadius: '6px', padding: '7px 18px',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem',
                color: T.secondary, cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
