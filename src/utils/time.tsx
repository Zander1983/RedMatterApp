const getHumanReadableTimeDifference = (date1: Date, date2: Date) => {
  const milliseconds = date2.getTime() - date1.getTime();
  function numberEnding(n: number) {
    return n > 1 ? "s" : "";
  }
  let temp = Math.floor(milliseconds / 1000);
  const years = Math.floor(temp / 31536000);
  if (years) {
    return years + " year" + numberEnding(years);
  }
  const months = Math.floor((temp %= 31536000) / 2592000);
  if (months) {
    return months + " month" + numberEnding(months);
  }
  const days = Math.floor((temp %= 2592000) / 86400);
  if (days) {
    return days + " day" + numberEnding(days);
  }
  const hours = Math.floor((temp %= 86400) / 3600);
  if (hours) {
    return hours + " hour" + numberEnding(hours);
  }
  const minutes = Math.floor((temp %= 3600) / 60);
  if (minutes) {
    return minutes + " minute" + numberEnding(minutes);
  }
  const seconds = temp % 60;
  if (seconds) {
    return seconds + " second" + numberEnding(seconds);
  }
  return "just now";
};

export { getHumanReadableTimeDifference };
