import dayjs from "dayjs";

const formatDate = (time: string | dayjs.Dayjs | Date, prefix?: string) => {
  const prefixSplit = prefix ?? "-";
  return dayjs(time).format(`YYYY${prefixSplit}MM${prefixSplit}DD`);
};

const formatDateMonth = (
  time: string | dayjs.Dayjs | Date,
  prefix?: string
) => {
  const prefixSplit = prefix ?? "-";
  return dayjs(time).format(`MM${prefixSplit}DD`);
};

const formatDateTime = (time: string | dayjs.Dayjs | Date, prefix?: string) => {
  const prefixSplit = prefix ?? "-";
  return dayjs(time).format(`YYYY${prefixSplit}MM${prefixSplit}DD HH:mm:ss`);
};

export const DateUtils = {
  formatDate,
  formatDateMonth,
  formatDateTime,
};
