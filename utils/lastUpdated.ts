export function getLastUpdatedLabel(): string {
  if (process.env.EXPO_PUBLIC_BUILD_TIME) {
    return process.env.EXPO_PUBLIC_BUILD_TIME;
  }

  return new Date().toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
