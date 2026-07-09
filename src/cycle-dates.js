// All cycle timing is anchored to US Eastern Time, always — never the
// server's or the browser's local time. Intl's timeZone conversion (not
// getDate()/getUTCDate()) is what makes that true regardless of where this
// code runs, and it handles the EST/EDT switch automatically.
const ET_ZONE = 'America/New_York'

function getETDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ET_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]))
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) }
}

function monthString(year, month) {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

// 1st–15th: members nominate. 16th–end of month: members answer.
export function getCyclePhase(date = new Date()) {
  return getETDateParts(date).day <= 15 ? 'nominating' : 'answering'
}

// True on the 1st of the month, ET — the day last month's cycle is due to
// auto-publish (checked hourly by the Phase 9 cron, so this alone doesn't
// need to be precise to the hour).
export function isPublishDay(date = new Date()) {
  return getETDateParts(date).day === 1
}

// The month whose cycle is currently nominating/answering, as 'YYYY-MM-01'.
export function getCurrentCycleMonth(date = new Date()) {
  const { year, month } = getETDateParts(date)
  return monthString(year, month)
}

// The prior month's cycle — the one that's publishing while this one opens.
export function getPreviousCycleMonth(date = new Date()) {
  const { year, month } = getETDateParts(date)
  return month === 1 ? monthString(year - 1, 12) : monthString(year, month - 1)
}
