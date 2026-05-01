export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${h}h ${m}m`;
};

export const getArrivalTime = (departure: string, duration: number) => {
  const date = new Date(departure);
  date.setMinutes(date.getMinutes() + duration);

  return date.toISOString().slice(11, 16);
};
