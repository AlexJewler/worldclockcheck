// WorldClockCheck — App Logic

const TIMEZONES = [
  { label: "New York (ET)", tz: "America/New_York" },
  { label: "Los Angeles (PT)", tz: "America/Los_Angeles" },
  { label: "Chicago (CT)", tz: "America/Chicago" },
  { label: "Denver (MT)", tz: "America/Denver" },
  { label: "Phoenix (AZ)", tz: "America/Phoenix" },
  { label: "Honolulu (HT)", tz: "Pacific/Honolulu" },
  { label: "Anchorage (AKT)", tz: "America/Anchorage" },
  { label: "Toronto", tz: "America/Toronto" },
  { label: "Vancouver", tz: "America/Vancouver" },
  { label: "Mexico City", tz: "America/Mexico_City" },
  { label: "São Paulo", tz: "America/Sao_Paulo" },
  { label: "Buenos Aires", tz: "America/Argentina/Buenos_Aires" },
  { label: "London (GMT/BST)", tz: "Europe/London" },
  { label: "Paris / Berlin (CET)", tz: "Europe/Paris" },
  { label: "Amsterdam", tz: "Europe/Amsterdam" },
  { label: "Madrid", tz: "Europe/Madrid" },
  { label: "Rome", tz: "Europe/Rome" },
  { label: "Stockholm", tz: "Europe/Stockholm" },
  { label: "Helsinki", tz: "Europe/Helsinki" },
  { label: "Moscow", tz: "Europe/Moscow" },
  { label: "Istanbul", tz: "Europe/Istanbul" },
  { label: "Dubai", tz: "Asia/Dubai" },
  { label: "Riyadh", tz: "Asia/Riyadh" },
  { label: "Mumbai", tz: "Asia/Kolkata" },
  { label: "Delhi", tz: "Asia/Kolkata" },
  { label: "Dhaka", tz: "Asia/Dhaka" },
  { label: "Bangkok", tz: "Asia/Bangkok" },
  { label: "Singapore", tz: "Asia/Singapore" },
  { label: "Hong Kong", tz: "Asia/Hong_Kong" },
  { label: "Shanghai / Beijing", tz: "Asia/Shanghai" },
  { label: "Seoul", tz: "Asia/Seoul" },
  { label: "Tokyo", tz: "Asia/Tokyo" },
  { label: "Sydney", tz: "Australia/Sydney" },
  { label: "Melbourne", tz: "Australia/Melbourne" },
  { label: "Auckland", tz: "Pacific/Auckland" },
  { label: "UTC", tz: "UTC" },
];

const WORLD_CLOCKS = [
  { city: "New York", country: "USA", tz: "America/New_York" },
  { city: "Los Angeles", country: "USA", tz: "America/Los_Angeles" },
  { city: "Chicago", country: "USA", tz: "America/Chicago" },
  { city: "Toronto", country: "Canada", tz: "America/Toronto" },
  { city: "London", country: "UK", tz: "Europe/London" },
  { city: "Paris", country: "France", tz: "Europe/Paris" },
  { city: "Berlin", country: "Germany", tz: "Europe/Berlin" },
  { city: "Dubai", country: "UAE", tz: "Asia/Dubai" },
  { city: "Mumbai", country: "India", tz: "Asia/Kolkata" },
  { city: "Singapore", country: "Singapore", tz: "Asia/Singapore" },
  { city: "Tokyo", country: "Japan", tz: "Asia/Tokyo" },
  { city: "Sydney", country: "Australia", tz: "Australia/Sydney" },
];

// Populate all select dropdowns
function populateSelects() {
  const selects = document.querySelectorAll('#fromZone, #toZone, .zone-select');
  selects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '';
    TIMEZONES.forEach((tz, i) => {
      const opt = document.createElement('option');
      opt.value = tz.tz;
      opt.textContent = tz.label;
      select.appendChild(opt);
    });
    if (currentVal) select.value = currentVal;
  });

  // Defaults
  const from = document.getElementById('fromZone');
  const to = document.getElementById('toZone');
  if (from) from.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  if (to) to.value = 'Europe/London';

  // Default input time to now
  const input = document.getElementById('inputTime');
  if (input) {
    const now = new Date();
    const local = new Date(now - now.getTimezoneOffset() * 60000);
    input.value = local.toISOString().slice(0, 16);
  }
}

// Convert time
function convertTime() {
  const inputEl = document.getElementById('inputTime');
  const fromEl = document.getElementById('fromZone');
  const toEl = document.getElementById('toZone');
  const resultEl = document.getElementById('convertResult');

  if (!inputEl.value) { resultEl.textContent = 'Please select a date and time.'; resultEl.className = 'result show'; return; }

  try {
    const dt = inputEl.value; // "YYYY-MM-DDTHH:mm"
    const fromTz = fromEl.value;
    const toTz = toEl.value;

    // Parse as if it is in the fromTz
    const [datePart, timePart] = dt.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    // Create a formatter that tells us the UTC offset for the fromTz at that moment
    const testDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

    const fromStr = new Intl.DateTimeFormat('en-US', {
      timeZone: fromTz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).formatToParts(testDate);

    const toFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone: toTz,
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(testDate);

    const fromLabel = TIMEZONES.find(t => t.tz === fromTz)?.label || fromTz;
    const toLabel = TIMEZONES.find(t => t.tz === toTz)?.label || toTz;

    resultEl.innerHTML = `<strong>${dt.replace('T', ' at ').slice(0, -0)} (${fromLabel})</strong> = <strong>${toFormatted} (${toLabel})</strong>`;
    resultEl.className = 'result show';
  } catch (e) {
    resultEl.textContent = 'Conversion error. Please check your inputs.';
    resultEl.className = 'result show';
  }
}

// Add zone to planner
function addZone() {
  const container = document.getElementById('plannerZones');
  const row = document.createElement('div');
  row.className = 'zone-row';
  row.innerHTML = `<select class="zone-select"></select><button class="btn-remove" onclick="removeZone(this)">✕</button>`;
  container.appendChild(row);
  const select = row.querySelector('.zone-select');
  TIMEZONES.forEach(tz => {
    const opt = document.createElement('option');
    opt.value = tz.tz;
    opt.textContent = tz.label;
    select.appendChild(opt);
  });
}

function removeZone(btn) {
  const rows = document.querySelectorAll('.zone-row');
  if (rows.length > 2) btn.parentElement.remove();
}

// Meeting planner
function planMeeting() {
  const zones = Array.from(document.querySelectorAll('.zone-select')).map(s => s.value);
  const result = document.getElementById('plannerResult');
  result.innerHTML = '';

  const slots = [];
  for (let h = 0; h < 24; h++) {
    const times = zones.map(tz => {
      const d = new Date();
      d.setHours(h, 0, 0, 0);
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true
      }).format(d);
      const hourInTz = parseInt(new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour: 'numeric', hour12: false
      }).format(d));
      return { formatted, hourInTz, tz };
    });

    const allWorking = times.every(t => t.hourInTz >= 8 && t.hourInTz < 18);
    const someWorking = times.every(t => t.hourInTz >= 7 && t.hourInTz < 20);

    if (allWorking || someWorking) {
      slots.push({ h, times, allWorking });
    }
  }

  if (slots.length === 0) {
    result.innerHTML = '<p style="color:#64748B">No good overlap found. Try selecting fewer zones or consider asynchronous communication.</p>';
    return;
  }

  const label = document.createElement('p');
  label.style.cssText = 'font-weight:600;margin-bottom:12px;';
  label.textContent = 'Recommended meeting windows:';
  result.appendChild(label);

  slots.slice(0, 6).forEach(slot => {
    const div = document.createElement('div');
    div.className = `time-slot ${slot.allWorking ? 'good' : 'ok'}`;
    div.innerHTML = `
      <span>${slot.allWorking ? '✅' : '⚠️'}</span>
      <div>${slot.times.map((t, i) => `<strong>${TIMEZONES.find(z=>z.tz===zones[i])?.label.split(' ')[0]}:</strong> ${t.formatted}`).join(' &nbsp;|&nbsp; ')}</div>
    `;
    result.appendChild(div);
  });
}

// World clocks
function renderWorldClocks() {
  const grid = document.getElementById('clocksGrid');
  grid.innerHTML = '';
  WORLD_CLOCKS.forEach(c => {
    const div = document.createElement('div');
    div.className = 'clock-card';
    div.innerHTML = `
      <div class="clock-city">${c.city}</div>
      <div class="clock-country">${c.country}</div>
      <div class="clock-time" id="clock-${c.tz.replace(/\//g, '-')}">--:--:--</div>
      <div class="clock-date" id="date-${c.tz.replace(/\//g, '-')}">---</div>
    `;
    grid.appendChild(div);
  });
}

function updateClocks() {
  const now = new Date();
  WORLD_CLOCKS.forEach(c => {
    const timeEl = document.getElementById(`clock-${c.tz.replace(/\//g, '-')}`);
    const dateEl = document.getElementById(`date-${c.tz.replace(/\//g, '-')}`);
    if (!timeEl) return;
    timeEl.textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: c.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(now);
    dateEl.textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: c.tz, weekday: 'short', month: 'short', day: 'numeric'
    }).format(now);
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  populateSelects();
  renderWorldClocks();
  updateClocks();
  setInterval(updateClocks, 1000);
});
