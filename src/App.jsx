/** @format */

import { useState, useRef } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import useAuth from "./hooks/useAuth";
import { useCalendar } from "./hooks/useCalendar";
import { useGoals } from "./hooks/useGoals";
import { useEntries } from "./hooks/useEntries";
import { useAccordion } from "./hooks/useAccordion";
import { useResponsive } from "./hooks/useResponsive";
import {
  Plus,
  X,
  Calendar as CalendarIcon,
  Check,
  MinusCircle,
  Pencil,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CalendarCheck } from "lucide-react";
import "./App.css";
import styles from "./styles";
import { daysOfWeek, moodIcons, getGoalProgress } from "./utils/calendarUtils";
import GoalModal from "./components/GoalModal";
import EntryModal from "./components/EntryModal";
import CalendarCell from "./components/CalendarCell";

function App() {
  const { user, loading, login } = useAuth();
  
  // 캘린더 관련 훅
  const {
    currentDate,
    startDay,
    daysInMonth,
    monthKey,
    prevMonth,
    nextMonth,
    totalCells,
    weeks
  } = useCalendar();

  // 목표 관련 훅
  const {
    goals,
    goalColor,
    setGoalColor,
    showGoalModal,
    setShowGoalModal,
    goalName,
    setGoalName,
    goalType,
    setGoalType,
    goalTarget,
    setGoalTarget,
    editingGoal,
    setEditingGoal,
    currentGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    moveGoal,
    resetGoalForm
  } = useGoals(user, monthKey);

  // 엔트리 관련 훅
  const {
    entries,
    entryValues,
    setEntryValues,
    moodScore,
    setMoodScore,
    moodNote,
    setMoodNote,
    getEntryArray,
    saveEntry,
    resetEntryForm
  } = useEntries(user, monthKey);

  // 아코디언 관련 훅
  const {
    accordionDate,
    accordionEditMode,
    setAccordionEditMode,
    isAccordionClosing,
    closeAccordion,
    openAccordion
  } = useAccordion();

  // 반응형 관련 훅
  const {
    isMobile,
    goalsAccordionOpen,
    setGoalsAccordionOpen,
    goalSummaryAccordionOpen,
    setGoalSummaryAccordionOpen
  } = useResponsive();

  // 모달 상태
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // refs
  const weekRowRefs = useRef([]);
  const cellRefs = useRef({});

  // 날짜 클릭 핸들러
  const handleDateClick = (dateStr) => {
    if (currentGoals.length === 0) {
      alert("목표를 먼저 등록해주세요.");
      return;
    }

    // 아코디언이 이미 열려있으면 아무것도 하지 않음
    if (accordionDate) {
      return;
    }

    const entryData = entries[dateStr];
    const existing = getEntryArray(entryData);
    const existingMap = {};
    currentGoals.forEach((goal) => {
      const entry = existing.find((e) => e.name === goal.name);
      if (entry) {
        existingMap[goal.name] = entry;
      } else {
        existingMap[goal.name] = {
          ...goal,
          value: goal.type === "checkbox" ? true : goal.target || ""
        };
      }
    });
    setEntryValues(existingMap);
    setMoodScore(entryData?.moodScore ?? null);
    setMoodNote(entryData?.moodNote ?? "");

    // 데스크탑에서는 모달, 모바일에서는 아코디언
    if (!isMobile) {
      setModalDate(dateStr);
      setShowEntryModal(true);
    } else {
      openAccordion(dateStr);
    }
  };

  // 목표 저장 핸들러
  const handleGoalSave = () => {
    if (editingGoal) {
      updateGoal(editingGoal.name, {
        type: goalType,
        target: goalTarget,
        color: goalColor
      });
    } else {
      addGoal({
        name: goalName,
        type: goalType,
        target: goalTarget,
        color: goalColor
      });
    }
    resetGoalForm();
  };

  // 엔트리 저장 핸들러
  const handleEntrySave = async () => {
    // 숫자 목표 검증
    for (const entry of Object.values(entryValues)) {
      if (entry.type === "number") {
        const val = parseInt(entry.value, 10);
        if (isNaN(val) || Number(entry.value) !== val) {
          alert("숫자 목표는 정수만 입력할 수 있습니다.");
          return;
        }
      }
    }

    const entryData = {
      goals: Object.values(entryValues),
      moodScore,
      moodNote
    };

    if (showEntryModal && modalDate) {
      await saveEntry(modalDate, entryData);
      setShowEntryModal(false);
      setModalDate(null);
    } else if (accordionDate) {
      await saveEntry(accordionDate, entryData);
      setAccordionEditMode(false);
    }
  };

  // 캘린더 셀 렌더링
  const renderCalendarCell = (cellIdx, weekIdx) => {
    const day = cellIdx - startDay + 1;
    const isCurrentMonth = cellIdx >= startDay && day > 0 && day <= daysInMonth;
    const dateStr = isCurrentMonth ? currentDate.date(day).format("YYYY-MM-DD") : "";
    const isSelected = dateStr === accordionDate;

    return (
      <CalendarCell
        key={cellIdx}
        day={isCurrentMonth ? day : null}
        dateStr={dateStr}
        currentGoals={currentGoals}
        entries={entries}
        getEntryArray={getEntryArray}
        isSelected={isSelected}
        isAccordionClosing={isAccordionClosing}
        onCellClick={handleDateClick}
        cellRef={(el) => {
          if (dateStr) cellRefs.current[dateStr] = el;
        }}
      />
    );
  };

  // 아코디언 렌더링
  const renderAccordion = (weekIdx) => {
    if (!accordionDate || isAccordionClosing) return null;

    return (
      <div
        key={`week-accordion-${weekIdx}`}
        className="relative sm:hidden"
      >
        {/* 아코디언 카드 */}
        <div
          className={`${styles.calendarAccordionCard} calendar-accordion-card`}
          style={{
            transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
            maxHeight: isAccordionClosing ? 0 : 600,
            opacity: isAccordionClosing ? 0 : 1,
            overflow: "hidden",
            padding: isAccordionClosing ? 0 : 12,
            boxShadow: "none",
            position: "relative",
            margin: "0 auto",
            transform: isAccordionClosing ? "translateY(-20px)" : "translateY(0)",
            animation: isAccordionClosing ? "none" : "fadeIn 0.5s cubic-bezier(0.4,0,0.2,1)",
            backgroundColor: "#e5e7eb"
          }}
        >
          {/* 아코디언 닫기 버튼 */}
          <button
            onClick={closeAccordion}
            className="absolute top-2 right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
            style={{ fontSize: '12px' }}
            aria-label="아코디언 닫기"
          >
            ×
          </button>
          <div className="space-y-4">
            {/* 감정 점수 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                오늘의 감정 상태
              </label>
              <div className="flex gap-2 text-2xl mb-2 justify-center">
                {moodIcons.map((icon, score) => (
                  <button
                    key={score}
                    className={`px-1 ${
                      moodScore === score
                        ? "ring-2 ring-blue-500 rounded"
                        : ""
                    }`}
                    onClick={() =>
                      accordionEditMode && setMoodScore(score)
                    }
                    type="button"
                    disabled={!accordionEditMode}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            {/* 감정 메모 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                오늘 느낀 감정
              </label>
              <textarea
                maxLength={200}
                placeholder="오늘 느낀 감정을 간단히 적어보세요"
                className={`${styles.input} w-full`}
                value={moodNote}
                onChange={(e) =>
                  accordionEditMode && setMoodNote(e.target.value)
                }
                readOnly={!accordionEditMode}
                rows={8}
                style={{ minHeight: 160, resize: "none" }}
              />
            </div>
            {/* 목표별 달성 입력 (2열 grid) */}
            <div className="grid grid-cols-2 gap-3">
              {currentGoals.map((goal) => (
                <div key={goal.name} className="flex items-center gap-2">
                  <label className="text-sm flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${goal.color}`}
                    />
                    {goal.name}
                  </label>
                  {goal.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={entryValues[goal.name]?.value || false}
                      onChange={(e) =>
                        accordionEditMode &&
                        setEntryValues({
                          ...entryValues,
                          [goal.name]: {
                            ...goal,
                            value: e.target.checked
                          }
                        })
                      }
                      className="w-5 h-5"
                      disabled={!accordionEditMode}
                    />
                  ) : (
                    <input
                      type="number"
                      placeholder="분 단위로 입력하세요"
                      value={entryValues[goal.name]?.value || ""}
                      onChange={(e) =>
                        accordionEditMode &&
                        setEntryValues({
                          ...entryValues,
                          [goal.name]: {
                            ...goal,
                            value: e.target.value
                          }
                        })
                      }
                      className={styles.input}
                      readOnly={!accordionEditMode}
                    />
                  )}
                </div>
              ))}
            </div>
            {/* 버튼 영역 */}
            <div className="flex justify-end gap-2 pt-4">
              {!accordionEditMode ? (
                <button
                  onClick={() => setAccordionEditMode(true)}
                  className={styles.button.primary}
                >
                  수정
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setAccordionEditMode(false)}
                    className={styles.button.secondary}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleEntrySave}
                    className={styles.button.primary}
                  >
                    저장
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 캘린더 렌더링
  const renderCalendar = () => {
    const rows = [];
    let cellIdx = 0;

    for (let w = 0; w < weeks; w++) {
      const weekCells = [];
      
      for (let d = 0; d < 7; d++) {
        weekCells.push(renderCalendarCell(cellIdx, w));
        cellIdx++;
      }

      // 해당 주에 아코디언이 열려있는지 확인
      const weekDates = Array.from({ length: 7 }, (_, d) => {
        const day = w * 7 + d - startDay + 1;
        return day > 0 && day <= daysInMonth
          ? currentDate.date(day).format("YYYY-MM-DD")
          : null;
      });
      const showAccordion = weekDates.includes(accordionDate);

      if (showAccordion && accordionDate) {
        rows.push(
          <div key={`week-accordion-${w}`}>
            {/* 주(week) 렌더링 */}
            <div
              className={styles.calendarWeekRow}
              style={{ position: "relative" }}
              ref={(el) => (weekRowRefs.current[w] = el)}
            >
              {weekCells}
            </div>
            {renderAccordion(w)}
          </div>
        );
      } else {
        rows.push(
          <div
            key={`week-${w}`}
            className={styles.calendarWeekRow}
            style={{ minHeight: 64, position: "relative" }}
            ref={(el) => (weekRowRefs.current[w] = el)}
          >
            {weekCells}
          </div>
        );
      }
    }

    return rows;
  };

  // 목표별 월간 현황 테이블 렌더 함수
  const renderGoalSummary = () => {
    if (currentGoals.length === 0) return null;
    
    const dateList = Array.from({ length: daysInMonth }, (_, i) =>
      currentDate.date(i + 1).format("YYYY-MM-DD")
    );

    return (
      <div className={`p-4 bg-white rounded-lg shadow mb-4 accordion${
        goalSummaryAccordionOpen ? " open" : ""
      }`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">📊 목표별 월간 현황</span>
            <button
              className="ml-1 text-gray-500 hover:text-blue-500 focus:outline-none"
              onClick={() => setGoalSummaryAccordionOpen((open) => !open)}
              aria-label={
                goalSummaryAccordionOpen ? "월간 현황 접기" : "월간 현황 펼치기"
              }
              type="button"
            >
              {goalSummaryAccordionOpen ? (
                <span className="inline-block">▲</span>
              ) : (
                <span className="inline-block">▼</span>
              )}
            </button>
          </div>
        </div>
        <div className="accordion-content">
          <div className="overflow-x-auto text-xs sm:text-sm">
            <table className="table-auto border-collapse w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">날짜</th>
                  {currentGoals.map((goal) => (
                    <th key={goal.name} className="border px-2 py-1 text-center">
                      {goal.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dateList.map((date) => (
                  <tr key={date}>
                    <td className="border px-2 py-1">
                      {dayjs(date).format("M/D")}
                    </td>
                    {currentGoals.map((goal) => {
                      const entryData = entries[date];
                      const entryArray = getEntryArray(entryData);
                      const dayEntry = entryArray.find(
                        (e) => e.name === goal.name
                      );
                      const content =
                        goal.type === "checkbox"
                          ? dayEntry?.value
                            ? "✅"
                            : "❌"
                          : dayEntry?.value || "-";
                      return (
                        <td
                          key={goal.name}
                          className="border px-2 py-1 text-center"
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Guard for loading/auth
  if (loading) return <div>Loading...</div>;
  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="mb-4 text-lg font-semibold">로그인을 해주세요</h2>
        <button
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Google로 로그인
        </button>
      </div>
    );

  return (
    <div className={`${styles.container} px-0 sm:px-4`}>
      <div className={`${styles.maxWidth} bg-white rounded-lg shadow-md p-2`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className={`${styles.text.title} flex items-center gap-2`}>
            <CalendarIcon className="w-6 h-6" />
            <span>Habit Calendar v1.1</span>
          </div>
          <button
            onClick={() => {
              import("firebase/auth").then(({ getAuth, signOut }) => {
                const auth = getAuth();
                signOut(auth);
              });
            }}
            className="text-sm text-gray-500 hover:text-red-500 underline"
          >
            로그아웃
          </button>
        </div>

        {/* Goals Section */}
        <div
          className={`p-4 bg-white rounded-lg shadow mb-4 accordion${
            goalsAccordionOpen ? " open" : ""
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <CalendarCheck size={20} />
              <span className="text-lg font-semibold">
                {currentDate.format("M월")} 목표 달성 현황
              </span>
              <button
                className="ml-1 text-gray-500 hover:text-blue-500 focus:outline-none"
                onClick={() => setGoalsAccordionOpen((open) => !open)}
                aria-label={
                  goalsAccordionOpen ? "목표 현황 접기" : "목표 현황 펼치기"
                }
                type="button"
              >
                {goalsAccordionOpen ? (
                  <span className="inline-block">▲</span>
                ) : (
                  <span className="inline-block">▼</span>
                )}
              </button>
            </div>
            <button
              className="inline-flex items-center px-1 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
              onClick={() => setShowGoalModal(true)}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="accordion-content">
            {currentGoals.length === 0 ? (
              <p className="text-gray-500 text-sm">
                아직 등록된 목표가 없습니다.
              </p>
            ) : (
              <>
                {/* 목표별 통계 및 Progress Bar 통합 */}
                <div className="space-y-4 mt-4">
                  {currentGoals.map((goal, index) => {
                    const { label, percent } = getGoalProgress(goal, entries, currentDate);
                    const barWidth = Math.min(percent, 100);
                    return (
                      <div key={goal.name} className="flex flex-col gap-1 mb-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700">
                          <span>
                            월간 {goal.name} 달성도: {label} ({percent}%)
                          </span>
                          <div className="flex items-center">
                            <div className="flex items-center gap-1">
                              <button
                                className="text-gray-500 hover:text-blue-500"
                                disabled={index === 0}
                                onClick={() => moveGoal(index, index - 1)}
                                aria-label="위로 이동"
                                type="button"
                              >
                                ↑
                              </button>
                              <button
                                className="text-gray-500 hover:text-blue-500"
                                disabled={index === currentGoals.length - 1}
                                onClick={() => moveGoal(index, index + 1)}
                                aria-label="아래로 이동"
                                type="button"
                              >
                                ↓
                              </button>
                            </div>
                            <button
                              className="ml-2 text-gray-500 hover:text-blue-500"
                              onClick={() => {
                                setGoalName(goal.name);
                                setGoalType(goal.type);
                                setGoalTarget(goal.target || "");
                                setGoalColor(goal.color || "bg-red-500");
                                setEditingGoal(goal);
                                setShowGoalModal(true);
                              }}
                              aria-label="수정"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="ml-1 text-gray-500 hover:text-red-500"
                              onClick={() => deleteGoal(goal)}
                              aria-label="삭제"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${
                              goal.color || "bg-red-500"
                            } h-2 rounded-full`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            {currentDate.format("YYYY년 M월")}
          </h2>
          <button
            onClick={nextMonth}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar Days Header */}
        <div className={`${styles.calendarGrid} ${styles.calendarHeader}`}>
          {daysOfWeek.map((day, idx) => (
            <div
              key={idx}
              className="text-center border rounded-md py-1 font-semibold text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div 
          className={styles.calendarGridFlex}
          onClick={(e) => {
            // 아코디언 외부 클릭 시 닫기
            if (accordionDate && !e.target.closest('.calendar-accordion-card') && !e.target.closest('.calendar-cell')) {
              e.preventDefault();
              e.stopPropagation();
              closeAccordion();
              return false;
            }
          }}
        >
          {renderCalendar()}
        </div>

        {/* 목표별 월간 현황 */}
        <div style={{ marginTop: '16px' }}>
          {renderGoalSummary()}
        </div>

        {/* Goal Modal */}
        <GoalModal
          showGoalModal={showGoalModal}
          editingGoal={editingGoal}
          goalName={goalName}
          setGoalName={setGoalName}
          goalType={goalType}
          setGoalType={setGoalType}
          goalTarget={goalTarget}
          setGoalTarget={setGoalTarget}
          goalColor={goalColor}
          setGoalColor={setGoalColor}
          onSave={handleGoalSave}
          onClose={resetGoalForm}
        />

        {/* Entry Modal */}
        <EntryModal
          showEntryModal={showEntryModal}
          modalDate={modalDate}
          currentGoals={currentGoals}
          entryValues={entryValues}
          setEntryValues={setEntryValues}
          moodScore={moodScore}
          setMoodScore={setMoodScore}
          moodNote={moodNote}
          setMoodNote={setMoodNote}
          onSave={handleEntrySave}
          onClose={() => {
            setShowEntryModal(false);
            setModalDate(null);
          }}
        />
      </div>
    </div>
  );
}

export default App;
