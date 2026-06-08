/**
 * Lists the Cal.com event types on the authenticated account, so we can map each
 * session to its numeric eventTypeId in src/data/sessions.ts.
 * Run:  node --env-file=.env scripts/cal-event-types.mjs
 * Reads CALCOM_API_KEY at runtime; never prints it.
 */
const key = process.env.CALCOM_API_KEY;
if (!key) {
  console.error('✗ CALCOM_API_KEY is not set in .env');
  process.exit(1);
}

async function attempt(version) {
  const r = await fetch('https://api.cal.com/v2/event-types', {
    headers: { Authorization: `Bearer ${key}`, ...(version ? { 'cal-api-version': version } : {}) },
  });
  return { status: r.status, text: await r.text() };
}

for (const v of ['2024-06-14', '2024-08-13', '']) {
  const { status, text } = await attempt(v);
  if (status === 200) {
    const json = JSON.parse(text);
    const list = json.data ?? [];
    console.log(`✓ (cal-api-version='${v}') ${list.length} event type(s):`);
    for (const et of list) {
      console.log(`  id=${et.id}  title="${et.title}"  slug="${et.slug}"  length=${et.lengthInMinutes ?? et.length ?? '?'}min`);
    }
    process.exit(0);
  }
  console.log(`(version='${v}' -> HTTP ${status}) ${text.slice(0, 200)}`);
}
console.error('✗ Could not list event types. Check the API key.');
process.exit(1);
