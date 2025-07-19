import { useState, useEffect } from "react";
import dayjs from "dayjs";

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();
  const monthKey = currentDate.format("YYYY-MM");

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  // 전체 셀 수 계산 (첫 주 빈 셀 + 월의 날짜 수 + 마지막 주 빈 셀)
  const totalCells = startDay + daysInMonth + (7 - ((startDay + daysInMonth) % 7)) % 7;
  const weeks = Math.ceil(totalCells / 7);

  return {
    currentDate,
    setCurrentDate,
    startOfMonth,
    endOfMonth,
    startDay,
    daysInMonth,
    monthKey,
    prevMonth,
    nextMonth,
    totalCells,
    weeks
  };
}; 