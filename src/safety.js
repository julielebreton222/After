import lines from './story/crisis-lines.json'

// Clear phrases about not wanting to live, in English and French. Used to show
// the "I'm not okay" page after any WRITE. The text never leaves the phone.
const PATTERNS = [
  /\bkill(ing)? my ?self\b/, /\bend(ing)? (my|it) (life|all)\b/, /\bend it\b/, /\btake my (own )?life\b/,
  /\b(want|wanna|wish|going) to die\b/, /\bwant to be dead\b/, /\bwish i (was|were) dead\b/,
  /\b(don'?t|do not|no longer) want to (live|be alive|be here|exist|wake up)\b/,
  /\bsuicid/, /\bbetter off (dead|without me)\b/, /\bno (reason|point) (to|in) (live|living)\b/,
  /\bnot want to (live|be alive)\b/,
  /\bme suicider\b/, /\bme tuer\b/, /\ben finir\b/, /\bmettre fin à (mes jours|ma vie)\b/,
  /\b(envie de|veux|voudrais) mourir\b/, /\bplus envie de vivre\b/, /\bmarre de vivre\b/,
]

export function soundsUnsafe(text) {
  const t = String(text || '').toLowerCase().replace(/[’']/g, "'")
  return PATTERNS.some((p) => p.test(t))
}

const TZ = {
  'Europe/Paris': 'FR', 'Europe/Brussels': 'BE', 'Europe/Zurich': 'CH', 'Europe/London': 'GB',
  'Europe/Dublin': 'IE', 'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Amsterdam': 'NL',
  'America/Toronto': 'CA', 'America/Montreal': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA', 'America/Regina': 'CA',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
  'America/Phoenix': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU', 'Pacific/Auckland': 'NZ',
}

export function detectCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (TZ[tz]) return TZ[tz]
  } catch { /* ignore */ }
  const region = (navigator.language || '').split('-')[1]?.toUpperCase()
  if (region && lines.countries[region]) return region
  return lines.default
}

export { lines as crisisLines }
