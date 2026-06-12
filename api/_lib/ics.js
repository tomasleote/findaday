function formatICSDate(dateStr) {
  // dateStr is YYYY-MM-DD; convert to YYYYMMDD for ICS all-day format
  return dateStr.replace(/-/g, '');
}

function generateICS({ title, startDate, endDate, description }) {
  // endDate in ICS all-day events is exclusive (day after last day)
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);
  const endStr = end.toISOString().split('T')[0].replace(/-/g, '');
  const startStr = formatICSDate(startDate);
  const uid = `${Date.now()}@findaday`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Find A Day//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${startStr}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

module.exports = { formatICSDate, generateICS };
