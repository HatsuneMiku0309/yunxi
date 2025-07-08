export function getTimeZoneName() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}