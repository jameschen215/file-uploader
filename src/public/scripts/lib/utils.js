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
