import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import { ARCHETYPES, getPetMessage } from '../data/archetypes.js'

// ── Light theme tokens ────────────────────────────────────────────────────────
const T = {
  bg:        '#FFFFFF',
  surface:   '#F5F6F8',
  border:    '#E5E7EB',
  borderMid: '#D1D5DB',
  navy:      '#1B3A6B',
  navyLight: '#2A5298',
  secondary: '#6B7280',
  overlay:   'rgba(0,0,0,0.28)',
}

const CAT_COLOR = { academic: '#4F8EF7', recruiting: '#E84545', personal: '#1DAF72' }
const CAT_BG    = { academic: '#EFF6FF', recruiting: '#FEF2F2', personal: '#F0FDF4' }

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
const TODAY = 13

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
  ],
  // ── Week 2 (past, today = 13) ─────────────────────────────────────────
  9:  [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
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
    { label: 'Review Notes',        cat: 'academic',   time: '20:00', duration: 60 },
  ],
  17: [
    { label: 'BUS 160 Team Mtg',    cat: 'academic',   time: '14:00', duration: 60 },
    { label: 'Tech Training',       cat: 'academic',   time: '19:00', duration: 90 },
  ],
  18: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
    { label: 'Coffee Chat',         cat: 'recruiting', time: '11:00', duration: 45 },
    { label: 'ECON PS Due',         cat: 'academic',   time: '23:59', duration: 0, isDeadline: true },
  ],
  19: [
    { label: 'Study Group',         cat: 'academic',   time: '13:00', duration: 90 },
    { label: 'Test Prep',           cat: 'academic',   time: '18:00', duration: 120 },
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
    { label: 'Goldman Due',         cat: 'recruiting', time: '23:59', duration: 0, isDeadline: true },
  ],
  23: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
  ],
  24: [
    { label: 'BUS 160 Team Mtg',    cat: 'academic',   time: '14:00', duration: 60 },
    { label: 'Mock Interview',      cat: 'recruiting', time: '16:00', duration: 60 },
  ],
  25: [
    { label: 'Gym',                 cat: 'personal',   time: '07:00', duration: 60 },
    { label: 'ECON 301',            cat: 'academic',   time: '09:00', duration: 75 },
  ],
  26: [
    { label: 'Tech Interview Prep', cat: 'recruiting', time: '15:00', duration: 90 },
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
  20: "Heads up — Goldman deadline Sunday and ECON midterm are both this week. Your best prep window is Tuesday night.",
}

const COMMAND_CENTER_ITEMS = [
  { priority: 'red',    label: 'Goldman Sachs app deadline',  detail: 'Sun Mar 22 · 11:59pm' },
  { priority: 'red',    label: 'ECON 301 midterm',            detail: 'Fri Mar 20 · 9am'     },
  { priority: 'yellow', label: 'ECON 301 problem set due',    detail: 'Wed Mar 18 · 11:59pm' },
  { priority: 'yellow', label: 'Coffee chat — prep needed',   detail: 'Wed Mar 18 · 11am'    },
  { priority: 'green',  label: 'Get tux for Fancy Dress',     detail: 'Sat Mar 21 · 11am'    },
]
const PRIORITY_COLOR = { red: '#E84545', yellow: '#D97706', green: '#1DAF72' }
const PRIORITY_BG    = { red: '#FEF2F2', yellow: '#FFFBEB', green: '#F0FDF4' }

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
  { label: 'Goldman Sachs — App Deadline', date: 'Mar 22' },
  { label: 'Coffee Chat with Alumnus',     date: 'Mar 18' },
  { label: 'CPD Office Meeting',           date: 'Mar 20' },
  { label: 'Mock Interview Prep',          date: 'Mar 24' },
  { label: 'Google Info Session',          date: 'Mar 27' },
]
const NETWORKING_CONTACTS = [
  { name: 'Sarah Chen',               company: 'Goldman Sachs', role: 'VP Recruiting', dateMet: 'Feb 12', status: 'Thank you sent ✓',      statusColor: '#1DAF72' },
  { name: 'James Walker',             company: 'McKinsey',      role: 'Associate',     dateMet: 'Feb 8',  status: 'Follow-up pending ⚠️',  statusColor: '#D97706' },
  { name: 'Alumni (Coffee Chat)',     company: 'TBD',           role: 'TBD',           dateMet: 'Today',  status: 'Not yet contacted 🔴',  statusColor: '#E84545' },
]
const PERSONAL_TASKS = [
  'Gym Session',
  'Grocery Shopping',
  'Call Mom',
  'Pay Bills',
  'Schedule Dentist Appointment',
  'Go get tux for Fancy Dress',
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
              backgroundColor: isFlexible ? '#FFFBEB' : CAT_BG[ev.cat],
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
                  backgroundColor: isFlexible ? '#FEF3C7' : T.surface,
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
              backgroundColor: '#FFFBEB', borderRadius: '7px',
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
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.66rem', fontWeight: 500,
                      color: CAT_COLOR[d.cat], backgroundColor: CAT_BG[d.cat],
                      border: `1px solid ${CAT_COLOR[d.cat]}40`,
                      borderRadius: '20px', padding: '2px 10px',
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
          <div style={{ display: 'flex' }}>

            {/* Hour labels */}
            <div style={{ width: '44px', flexShrink: 0, userSelect: 'none' }}>
              {HOURS.map(h => (
                <div key={h} style={{
                  height: `${ROW_H}px`,
                  display: 'flex', alignItems: 'flex-start', paddingTop: '4px',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', color: T.secondary,
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
                const height = Math.max((ev.duration / 60) * ROW_H, 26)
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
                      fontFamily: 'DM Sans, sans-serif', fontSize: '0.74rem', fontWeight: 500,
                      color: CAT_COLOR[ev.cat], margin: 0, lineHeight: 1.2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ev.label}
                    </p>
                    {height > 34 && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', color: T.secondary, margin: '1px 0 0 0' }}>
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

  const [activeTab,    setActiveTab]    = useState('master')
  const [showCC,       setShowCC]       = useState(false)
  const [selectedDay,  setSelectedDay]  = useState(null)
  const [personalDone, setPersonalDone] = useState({})
  const [xp,           setXp]           = useState(0)
  const [showPetModal, setShowPetModal] = useState(false)
  const [showBanner,   setShowBanner]   = useState(false)
  const bannerTimerRef = useRef(null)

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  // Pet widget message context based on real day-of-week
  const dow = new Date().getDay()
  const petContext =
    dow === 0 ? 'recruitingDeadline' :
    dow === 4 ? 'examTomorrow'       :
    dow === 6 ? 'saturday'           : 'morning'

  const petMsg = getPetMessage(archetypeId, humorStyle, petContext, name)

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

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: T.bg,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
      animation: 'fade-in 400ms ease-out forwards',
    }}>

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
      }}>
        <div>
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontWeight: 300,
            fontSize: 'clamp(0.78rem, 1.4vw, 0.95rem)', color: T.secondary, margin: 0,
          }}>
            Good {timeGreeting},
          </p>
          <p style={{
            fontFamily: 'Playfair Display, serif', fontWeight: 600,
            fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)', color: T.navy, margin: 0, lineHeight: 1.2,
          }}>
            {name}.
          </p>
        </div>

        {/* Pet widget */}
        <button
          onClick={() => setShowPetModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: `${archetype.color}12`,
            border: `1px solid ${archetype.color}40`,
            borderRadius: '10px', padding: '8px 12px',
            cursor: 'pointer', transition: 'background-color 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${archetype.color}20` }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${archetype.color}12` }}
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

      {/* ── TAB BAR ─────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, display: 'flex',
        borderBottom: `1px solid ${T.border}`,
        padding: `0 clamp(16px, 3vw, 28px)`,
      }}>
        {TABS.map(tab => (
          <button key={tab}
            onClick={() => { setActiveTab(tab); setShowCC(false) }}
            style={{
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? `2px solid ${T.navy}` : '2px solid transparent',
              color: activeTab === tab ? T.navy : T.secondary,
              fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
              fontSize: 'clamp(0.78rem, 1.4vw, 0.88rem)', letterSpacing: '0.03em',
              padding: 'clamp(8px, 1.5vh, 12px) clamp(12px, 2vw, 20px)',
              cursor: 'pointer', textTransform: 'capitalize',
              transition: 'color 150ms ease, border-color 150ms ease',
              marginBottom: '-1px',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* ── MASTER ──────────────────────────────────────── */}
        {activeTab === 'master' && (
          <div style={{
            height: '100%', overflowY: 'auto',
            padding: 'clamp(12px, 2vh, 18px) clamp(16px, 3vw, 28px)',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>

            {/* Recruiting awareness banner */}
            <div style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '10px 14px',
              backgroundColor: T.navy, borderRadius: '8px',
            }}>
              <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>🕐</span>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.76rem',
                color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.55,
              }}>
                <strong style={{ color: 'white' }}>IB application windows open in 6 weeks</strong> — Goldman, JPM, and Evercore typically open late March. Your prep window is now.
              </p>
            </div>

            {/* Calendar */}
            <div style={{
              flexShrink: 0,
              flex: showCC ? '0 0 auto' : undefined,
              maxHeight: showCC ? '90px' : undefined,
              overflow: showCC ? 'hidden' : 'visible',
              transition: 'max-height 350ms ease',
            }}>
              <CalendarGrid compact={showCC} onDayClick={setSelectedDay} />
            </div>

            {/* Week Ahead */}
            {!showCC && (
              <div style={{
                flexShrink: 0,
                backgroundColor: T.surface, borderRadius: '10px',
                border: `1px solid ${T.border}`,
                padding: 'clamp(12px, 2vh, 16px) clamp(14px, 2.5vw, 20px)',
              }}>
                <p style={{
                  fontFamily: 'Playfair Display, serif', fontStyle: 'italic',
                  fontWeight: 400, fontSize: 'clamp(0.82rem, 1.4vw, 0.94rem)',
                  color: T.secondary, margin: '0 0 10px 0',
                }}>
                  Your week, {name}. Here's what matters.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { dot: CAT_COLOR.academic,   text: 'ECON 301 midterm Friday 9am — start review tonight' },
                    { dot: CAT_COLOR.recruiting, text: "Goldman Sachs deadline Sunday 11:59pm — don't let it sneak up" },
                    { dot: CAT_COLOR.recruiting, text: 'Coffee chat with alumni Wednesday — prep your talking points' },
                    { dot: CAT_COLOR.personal,   text: "Get tux Saturday before Fancy Dress — no one's covering for you" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.dot, flexShrink: 0, marginTop: '4px' }} />
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(0.78rem, 1.35vw, 0.88rem)', color: T.navy, opacity: 0.85, margin: 0, lineHeight: 1.45 }}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Command Center panel */}
            {showCC && (
              <div style={{
                flex: 1,
                backgroundColor: T.surface, borderRadius: '10px',
                border: `1px solid ${T.border}`,
                padding: 'clamp(12px, 2vh, 16px) clamp(14px, 2.5vw, 20px)',
                overflow: 'auto',
                animation: 'slide-up-fade 300ms ease-out forwards',
              }}>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.7rem', color: T.navy,
                  letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px 0',
                }}>
                  ⚡ Command Center
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {COMMAND_CENTER_ITEMS.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px',
                      backgroundColor: PRIORITY_BG[item.priority],
                      borderRadius: '7px',
                      border: `1px solid ${PRIORITY_COLOR[item.priority]}30`,
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: PRIORITY_COLOR[item.priority], flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(0.8rem, 1.45vw, 0.9rem)', color: T.navy, margin: '0 0 2px 0', fontWeight: 500 }}>{item.label}</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.67rem', color: T.secondary, margin: 0 }}>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress snapshot */}
            {!showCC && (
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
            )}

            {/* Floating CC button */}
            <button
              onClick={() => setShowCC(v => !v)}
              style={{
                position: 'sticky', bottom: '12px',
                alignSelf: 'flex-end',
                padding: '8px 18px',
                backgroundColor: showCC ? T.surface : T.navy,
                border: `1px solid ${showCC ? T.borderMid : T.navy}`,
                borderRadius: '20px',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: '0.76rem',
                color: showCC ? T.secondary : 'white',
                cursor: 'pointer',
                transition: 'background-color 150ms ease, color 150ms ease',
                boxShadow: showCC ? 'none' : '0 2px 8px rgba(27,58,107,0.18)',
                zIndex: 10,
              }}
              onMouseEnter={e => { if (!showCC) e.currentTarget.style.backgroundColor = T.navyLight }}
              onMouseLeave={e => { if (!showCC) e.currentTarget.style.backgroundColor = T.navy }}
            >
              {showCC ? '✕ Close' : '⚡ Command Center'}
            </button>
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
            <div>
              <Label>Upcoming Assignments</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {CANVAS_ASSIGNMENTS.map((a, i) => (
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
                  display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 1.2fr 0.8fr 1.4fr',
                  padding: '8px 14px',
                  backgroundColor: '#F0F1F3',
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  {['Name', 'Company', 'Role', 'Date Met', 'Follow-up'].map(h => (
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
                    display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 1.2fr 0.8fr 1.4fr',
                    padding: 'clamp(9px, 1.6vh, 13px) 14px',
                    borderBottom: i < NETWORKING_CONTACTS.length - 1 ? `1px solid ${T.border}` : 'none',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: T.navy, fontWeight: 500 }}>{c.name}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.secondary }}>{c.company}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.secondary }}>{c.role}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: T.secondary }}>{c.dateMet}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: c.statusColor, fontWeight: 500 }}>{c.status}</span>
                  </div>
                ))}
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
            <Label>Personal Checklist</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {PERSONAL_TASKS.map((task, i) => {
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
