import dayjs from "dayjs";

export default function combineTimeAndDate(time: Date, date: Date): Date {
  const hour = dayjs(time).hour();
  const minute = dayjs(time).minute();
  const dateAndTime = dayjs(date).hour(hour).minute(minute);

  return dateAndTime.toDate();
}
