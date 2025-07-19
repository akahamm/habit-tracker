import dayjs from "dayjs";
import styles from "../styles";
import { isFutureDate, isToday } from "../utils/calendarUtils";

const CalendarCell = ({
  day,
  dateStr,
  currentGoals,
  entries,
  getEntryArray,
  isSelected,
  isAccordionClosing,
  onCellClick,
  cellRef
}) => {
  const isCurrentMonth = day > 0;
  const isFuture = isFutureDate(dateStr);
  const isTodayDate = isToday(dateStr);

  if (!isCurrentMonth) {
    return (
      <div 
        className="w-full"
      />
    );
  }

  return (
    <div
      ref={cellRef}
      className={[
        styles.calendarCellMobileWrapper,
        "calendar-cell w-full",
        isFuture
          ? "bg-gray-100 cursor-not-allowed"
          : isTodayDate
            ? styles.todayCell
            : isSelected
              ? styles.selectedCell
              : "cursor-pointer"
      ].join(" ")}
      onClick={(e) => {
        e.stopPropagation();
        if (isFuture) return;
        onCellClick(dateStr);
      }}
    >
      {/* 모바일: 목표 색상바 오버레이 + 날짜 숫자 */}
      <div className="block sm:hidden w-full h-full">
        <div className={styles.calendarGoalBarMobileOverlay}>
          {currentGoals.map((goal, idx) => {
            const entryData = entries[dateStr];
            const entryArr = getEntryArray(entryData);
            const entry = entryArr.find((e) => e.name === goal.name);
            const achieved =
              goal.type === "checkbox"
                ? entry?.value
                : entry && entry.value && Number(entry.value) > 0;
            const total = currentGoals.length;
            const top = (idx / total) * 100;
            const height = 100 / total;
            
            // 선택된 날짜일 때 아코디언 배경색과 동일하게 변경
            const isSelectedDate = isSelected;
            const barColor = isSelectedDate ? "#e5e7eb" : (achieved ? goal.color : "bg-white");
            
            // 선택된 날짜일 때 배경색 적용
            if (isSelectedDate) {
              return (
                <div
                  key={goal.name}
                  className={styles.calendarGoalBarMobile}
                  style={{
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    top: `${top}%`,
                    height: `${height}%`,
                    opacity: 1,
                    backgroundColor: barColor,
                    borderRadius:
                      idx === 0
                        ? "8px 8px 0 0"
                        : idx === total - 1
                          ? "0 0 0 0"
                          : 0,
                    zIndex: 0
                  }}
                ></div>
              );
            }
            
            return (
              <div
                key={goal.name}
                className={[
                  styles.calendarGoalBarMobile,
                  achieved ? goal.color : "bg-white"
                ].join(" ")}
                style={{
                  position: "absolute",
                  left: 0,
                  width: "100%",
                  top: `${top}%`,
                  height: `${height}%`,
                  opacity: 0.4,
                  borderRadius:
                    idx === 0
                      ? "8px 8px 0 0"
                      : idx === total - 1
                        ? "0 0 8px 8px"
                        : 0,
                  zIndex: 0
                }}
              ></div>
            );
          })}
        </div>
        <div className={styles.calendarDayOnBarMobile}>{day}</div>
      </div>
      
      {/* 데스크탑: 색상바 + 텍스트 오버레이 */}
      <div className="hidden sm:block w-full h-full relative">
        <div className={styles.calendarGoalBarMobileOverlay}>
          {currentGoals.map((goal, idx) => {
            const entryData = entries[dateStr];
            const entryArr = getEntryArray(entryData);
            const entry = entryArr.find((e) => e.name === goal.name);
            const achieved =
              goal.type === "checkbox"
                ? entry?.value
                : entry && entry.value && Number(entry.value) > 0;
            const total = currentGoals.length;
            const top = (idx / total) * 100;
            const height = 100 / total;
            return (
              <div
                key={goal.name}
                className={[
                  styles.calendarGoalBarMobile,
                  achieved ? goal.color : "bg-white"
                ].join(" ")}
                style={{
                  position: "absolute",
                  left: 0,
                  width: "100%",
                  top: `${top}%`,
                  height: `${height}%`,
                  opacity: 0.3,
                  borderRadius:
                    idx === 0
                      ? "8px 8px 0 0"
                      : idx === total - 1
                        ? "0 0 8px 8px"
                        : 0,
                  zIndex: 0
                }}
              ></div>
            );
          })}
        </div>
        {/* 데스크탑 날짜 배경 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold z-10 text-gray-900 opacity-40 select-none pointer-events-none">
          {day}
        </div>
        {/* 데스크탑 텍스트 오버레이 */}
        <div className="absolute inset-0 p-1 z-10">
          <div className="text-xs text-gray-900 space-y-1 w-full overflow-hidden">
            {(() => {
              const entryData = entries[dateStr];
              const entryArr = getEntryArray(entryData);
              const count = currentGoals.filter((goal) =>
                entryArr.find((e) => e.name === goal.name)
              ).length;
              return count > 4 ? (
                <div className="text-xs text-gray-700 font-medium">
                  +{count - 4}개 더 있음
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarCell; 