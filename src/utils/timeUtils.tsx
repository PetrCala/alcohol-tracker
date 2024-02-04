export function isRecent(timestamp: number): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  return now - timestamp < fiveMinutes;
}

export function getTimestampAge(timestamp: number): string {
  const now = Date.now();
  const difference = now - timestamp;

  // Format the timestamp into human-readable form based on its age
  switch (true) {
    case difference < 60 * 1000:
      const seconds = Math.floor(difference / 1000);
      return `${seconds} seconds ago`;
    case difference < 60 * 60 * 1000:
      const minutes = Math.floor(difference / (60 * 1000));
      return `${minutes} minutes ago`;
    case difference < 24 * 60 * 60 * 1000:
      const hours = Math.floor(difference / (60 * 60 * 1000));
      return `${hours} hours ago`;
    case difference < 7 * 24 * 60 * 60 * 1000:
      const days = Math.floor(difference / (24 * 60 * 60 * 1000));
      return `${days} days ago`;
    case difference < 30 * 24 * 60 * 60 * 1000:
      const weeks = Math.floor(difference / (7 * 24 * 60 * 60 * 1000));
      return `${weeks} weeks ago`;
    case difference < 365 * 24 * 60 * 60 * 1000:
      const months = Math.floor(difference / (30 * 24 * 60 * 60 * 1000));
      return `${months} months ago`;
    default:
      const years = Math.floor(difference / (365 * 24 * 60 * 60 * 1000));
      return `${years} years ago`;
  }
}
