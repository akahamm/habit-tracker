import dayjs from "dayjs";

export const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

export const moodIcons = ["😢", "😟", "😐", "🙂", "😄", "🤩"];

// 목표별 달성률/라벨 계산 함수
export const getGoalProgress = (goal, entries, currentDate) => {
  let total = 0,
    count = 0,
    achieved = 0;
  Object.entries(entries).forEach(([dateStr, entryData]) => {
    if (!dayjs(dateStr).isSame(currentDate, "month")) return;
    const entryArr = Array.isArray(entryData)
      ? entryData
      : entryData?.goals || [];
    const entry = entryArr.find((e) => e.name === goal.name);
    if (!entry) return;
    if (goal.type === "checkbox") {
      count += 1;
      if (entry.value) achieved += 1;
    } else if (goal.type === "number" && entry.value) {
      total += parseInt(entry.value, 10);
      count += 1;
    }
  });
  const target = parseInt(goal.target, 10) || 0;
  if (goal.type === "checkbox") {
    const percent = target > 0 ? Math.round((achieved / target) * 100) : 0;
    return { label: `${achieved}일 / ${target}일`, percent };
  } else {
    const average = count > 0 ? Math.round(total / count) : 0;
    const percent = target > 0 ? Math.round((average / target) * 100) : 0;
    return { label: `평균 ${average}분 / ${target}분`, percent };
  }
};

// 날짜가 미래인지 확인
export const isFutureDate = (dateStr) => {
  const todayStr = dayjs().format("YYYY-MM-DD");
  return dayjs(dateStr).isAfter(todayStr);
};

// 오늘 날짜인지 확인
export const isToday = (dateStr) => {
  const todayStr = dayjs().format("YYYY-MM-DD");
  return dateStr === todayStr;
}; 