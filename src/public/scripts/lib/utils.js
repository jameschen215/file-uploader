export function formatTime(timeInSeconds) {
  let formatted = '';

  if (timeInSeconds < 60) {
    const seconds = String(timeInSeconds).padStart(2, 0);

    formatted = `00:${seconds}`;
  } else if (timeInSeconds < 3600) {
    const minutes = String(Math.floor(timeInSeconds / 60)).padStart(2, '0');
    const seconds = String(timeInSeconds % 60).padStart(2, '0');

    formatted = `${minutes}:${seconds}`;
  } else {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = String(
      Math.floor((timeInSeconds - 3600 * hours) / 60),
    ).padStart(2, '0');
    const seconds = String(
      timeInSeconds - 3600 * hours - 60 * minutes,
    ).padStart(2, '0');

    formatted = `${hours}:${minutes}:${seconds}`;
  }

  return formatted;
}

export function formatFileSize(size) {
  if (size < 2 ** 20) {
    return Math.ceil(size / 1024) + 'KB';
  }

  return (size / 1024 / 1024).toFixed(1) + 'MB';
}

export function formateDate(date) {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);

  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}, ${get('hour')}:${get('minute')}:${get('second')}`;
}
