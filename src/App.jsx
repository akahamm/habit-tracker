/** @format */

/** @format */

import { useEffect, useState } from "react";
import { format } from "date-fns";
import useAuth from "./hooks/useAuth";
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import dayjs from "dayjs";
import {
  Plus,
  X,
  Calendar as CalendarIcon,
  Check,
  MinusCircle,
  Pencil
} from "lucide-react";
import { CalendarCheck } from "lucide-react";
import "./App.css";
import styles from "./styles";
import { colorOptions } from "./styles";

const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

function App() {
  // 목표 순서 이동 함수
  const moveGoal = async (fromIndex, toIndex) => {
    const goalDocRef = doc(db, "users", user.uid, "goals", monthKey);
    const currentList = [...(goals[monthKey] || [])];
    if (
      fromIndex < 0 ||
      fromIndex >= currentList.length ||
      toIndex < 0 ||
      toIndex >= currentList.length
    )
      return;
    const [moved] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, moved);
    await setDoc(goalDocRef, { goals: currentList });
    setGoals((prev) => ({
      ...prev,
      [monthKey]: currentList
    }));
  };
  const { user, loading, login } = useAuth();
  const [currentDate, setCurrentDate] = useState(dayjs());
  // Goals and entries now loaded from Firestore
  const [goals, setGoals] = useState({});
  const [goalColor, setGoalColor] = useState("bg-red-500");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState("checkbox");
  const [goalTarget, setGoalTarget] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entries, setEntries] = useState({});
  const [entryValues, setEntryValues] = useState({});
  const [editingGoal, setEditingGoal] = useState(null);
  const [moodScore, setMoodScore] = useState(null);
  const [moodNote, setMoodNote] = useState("");
  const [activeTab, setActiveTab] = useState("entry");

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();
  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  // Month/year keys for Firestore docs
  const monthKey = currentDate.format("YYYY-MM");
  const currentGoals = goals[monthKey] || [];
  const moodIcons = ["😢", "😟", "😐", "🙂", "😄", "🤩"];

  // Load goals for current month/user
  useEffect(() => {
    if (!user || !monthKey) return;
    const fetchGoals = async () => {
      const goalDocRef = doc(db, "users", user.uid, "goals", monthKey);
      const goalDocSnap = await getDoc(goalDocRef);
      if (goalDocSnap.exists()) {
        setGoals((prev) => ({
          ...prev,
          [monthKey]: goalDocSnap.data().goals || []
        }));
      } else {
        setGoals((prev) => ({ ...prev, [monthKey]: [] }));
      }
    };
    fetchGoals();
  }, [user, monthKey]);

  // Load entries for current month/user
  useEffect(() => {
    if (!user || !monthKey) return;
    const fetchEntries = async () => {
      const entryDocRef = doc(db, "users", user.uid, "entries", monthKey);
      const entryDocSnap = await getDoc(entryDocRef);
      if (entryDocSnap.exists()) {
        setEntries(entryDocSnap.data().entries || {});
      } else {
        setEntries({});
      }
    };
    fetchEntries();
  }, [user, monthKey]);

  // Goal 삭제 함수
  const deleteGoal = async (goalToDelete) => {
    if (!user || !monthKey) return;
    const goalDocRef = doc(db, "users", user.uid, "goals", monthKey);
    const goalDocSnap = await getDoc(goalDocRef);
    let newGoals = [];
    if (goalDocSnap.exists()) {
      newGoals = (goalDocSnap.data().goals || []).filter(
        (g) => g.name !== goalToDelete.name
      );
    }
    await setDoc(goalDocRef, { goals: newGoals });
    setGoals((prev) => ({ ...prev, [monthKey]: newGoals }));

    const entryDocRef = doc(db, "users", user.uid, "entries", monthKey);
    const entryDocSnap = await getDoc(entryDocRef);
    if (entryDocSnap.exists()) {
      const oldEntries = entryDocSnap.data().entries || {};
      let changed = false;
      const updatedEntries = {};
      Object.entries(oldEntries).forEach(([date, entryData]) => {
        let entryArr = Array.isArray(entryData)
          ? entryData
          : Array.isArray(entryData?.goals)
          ? entryData.goals
          : [];
        const filteredArr = entryArr.filter(
          (e) => e.name !== goalToDelete.name
        );
        if (Array.isArray(entryData)) {
          updatedEntries[date] = filteredArr;
        } else if (Array.isArray(entryData?.goals)) {
          updatedEntries[date] = { ...entryData, goals: filteredArr };
        } else {
          updatedEntries[date] = entryData;
        }
        if (filteredArr.length !== entryArr.length) changed = true;
      });
      if (changed) {
        await setDoc(entryDocRef, { entries: updatedEntries });
        setEntries(updatedEntries);
      }
    }
  };

  // 목표 등록/수정 모달 닫기 및 상태 초기화 함수
  const resetGoalForm = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
    setGoalName("");
    setGoalType("checkbox");
    setGoalTarget("");
    setGoalColor("bg-red-500");
  };

  // 목표별 달성률/라벨 계산 함수
  const getGoalProgress = (goal) => {
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

  // entryValues 처리 함수
  const getEntryArray = (entryData) => {
    return Array.isArray(entryData)
      ? entryData
      : Array.isArray(entryData?.goals)
      ? entryData.goals
      : [];
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

  const renderCalendarCells = () => {
    const cells = [];
    const totalCells = startDay + daysInMonth;
    for (let i = 0; i < totalCells; i++) {
      const day = i - startDay + 1;
      const isCurrentMonth = i >= startDay;
      const dateStr = currentDate.date(day).format("YYYY-MM-DD");
      const todayStr = dayjs().format("YYYY-MM-DD");
      const isToday = dateStr === todayStr;
      const isFuture = dayjs(dateStr).isAfter(todayStr);
      cells.push(
        <div
          key={i}
          className={`${styles.calendarCell} min-h-[130px] ${
            isCurrentMonth
              ? isFuture
                ? "bg-gray-100 cursor-not-allowed"
                : isToday
                ? "bg-blue-100 border-blue-400"
                : "cursor-pointer"
              : "bg-gray-100 cursor-default"
          } relative`}
          onClick={() => {
            if (!isCurrentMonth || isFuture) return;
            if (currentGoals.length === 0) {
              alert("목표를 먼저 등록해주세요.");
              return;
            }
            setSelectedDate(dateStr);
            const entryData = entries[dateStr];
            const existing = getEntryArray(entryData);
            // Build entryValues for modal: for all currentGoals, use entry if exists, else default
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
            setShowEntryModal(true);
          }}
        >
          {isCurrentMonth && (
            <>
              <div className={styles.calendarDay}>{day}</div>
              <div className="mt-1 text-xs text-gray-600 space-y-1 w-full overflow-hidden">
                {currentGoals.slice(0, 4).map((goal, idx) => {
                  const entryData = entries[dateStr];
                  const entryArr = getEntryArray(entryData);
                  const entry = entryArr.find((e) => e.name === goal.name);
                  if (!entry) return null;
                  return (
                    <div key={idx} className="flex items-center gap-1 truncate">
                      <span className={`w-2 h-2 rounded-full ${goal.color}`} />
                      <span className="truncate">{goal.name}</span>
                      {entry.type === "checkbox" ? (
                        entry.value ? (
                          <span>✅</span>
                        ) : (
                          <span>❌</span>
                        )
                      ) : (
                        <span>{entry.value}분</span>
                      )}
                    </div>
                  );
                })}
                {(() => {
                  const entryData = entries[dateStr];
                  const entryArr = getEntryArray(entryData);
                  const count = currentGoals.filter((goal) =>
                    entryArr.find((e) => e.name === goal.name)
                  ).length;
                  return count > 4 ? (
                    <div className="text-xs text-gray-400">
                      +{count - 4}개 더 있음
                    </div>
                  ) : null;
                })()}
              </div>
            </>
          )}
        </div>
      );
    }
    return cells;
  };

  // 목표별 월간 현황 테이블 렌더 함수 (per-month goals)
  const renderGoalSummary = () => {
    if (currentGoals.length === 0) return null;
    const dateList = Array.from({ length: daysInMonth }, (_, i) =>
      currentDate.date(i + 1).format("YYYY-MM-DD")
    );
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">📊 목표별 월간 현황</h3>
        <div className="overflow-x-auto">
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
    );
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.maxWidth} ${styles.card}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className={`${styles.text.title} flex items-center gap-2`}>
            <CalendarIcon className="w-6 h-6" />
            <span>Habit Calendar v1.0</span>
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
        <div className="p-4 bg-white rounded-lg shadow mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <CalendarCheck size={20} />
              <span className="text-lg font-semibold">
                {currentDate.format("M월")} 목표 달성 현황
              </span>
            </div>
            <button
              className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
              onClick={() => setShowGoalModal(true)}
            >
              목표 등록
            </button>
          </div>
          {currentGoals.length === 0 ? (
            <p className="text-gray-500 text-sm">
              아직 등록된 목표가 없습니다.
            </p>
          ) : (
            <>
              {/* 목표별 통계 및 Progress Bar 통합 */}
              <div className="space-y-4 mt-4">
                {currentGoals.map((goal, index) => {
                  const { label, percent } = getGoalProgress(goal);
                  const barWidth = Math.min(percent, 100);
                  return (
                    <div key={goal.name} className="flex flex-col gap-1 mb-1">
                      <div className="flex items-center justify-between text-sm font-medium text-gray-700">
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
        {/* Calendar Controls */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className={styles.button.secondary}
            aria-label="이전 달"
          >
            이전
          </button>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            {currentDate.format("YYYY년 M월")}
          </h2>
          <button
            onClick={nextMonth}
            className={styles.button.secondary}
            aria-label="다음 달"
          >
            다음
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
        <div className={styles.calendarGrid}>{renderCalendarCells()}</div>
        {renderGoalSummary()}

        {/* Goal Modal */}
        {showGoalModal && (
          <div className={styles.modal}>
            <div className={`${styles.modalContent} ${styles.cardSmall}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={styles.text.title}>
                  {editingGoal ? "목표 수정" : "목표 등록"}
                </h3>
                <button
                  onClick={resetGoalForm}
                  className={styles.button.icon}
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className={styles.flex.gap2}>
                  <label className="w-20 text-sm text-gray-700">이름</label>
                  <input
                    type="text"
                    placeholder="예: 운동"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className={`${styles.input} flex-1`}
                    autoFocus
                  />
                </div>
                <div className={styles.flex.gap2}>
                  <label className="w-20 text-sm text-gray-700">유형</label>
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value)}
                    className={`${styles.input} flex-1`}
                  >
                    <option value="checkbox">체크박스</option>
                    <option value="number">숫자</option>
                  </select>
                </div>
                <div className={styles.flex.gap2}>
                  <label className="w-20 text-sm text-gray-700">
                    {goalType === "checkbox"
                      ? "월간 목표일수"
                      : "일간 목표시간"}
                  </label>
                  <input
                    type="number"
                    placeholder={goalType === "checkbox" ? "예: 20" : "예: 30"}
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className={`${styles.input} flex-1`}
                  />
                </div>
                {/* Color Dots */}
                <div className={styles.flex.gap2}>
                  <label className="w-20 text-sm text-gray-700">색상</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((opt) => (
                      <div
                        key={opt.name}
                        className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                          opt.class
                        } ${
                          goalColor === opt.class
                            ? "ring-2 ring-offset-2 ring-black"
                            : ""
                        }`}
                        onClick={() => setGoalColor(opt.class)}
                        title={opt.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={resetGoalForm}
                  className={styles.button.secondary}
                >
                  취소
                </button>
                <button
                  disabled={
                    !goalName.trim() ||
                    !goalTarget ||
                    (editingGoal &&
                      editingGoal.name === goalName.trim() &&
                      editingGoal.type === goalType &&
                      (editingGoal.target || "") === goalTarget &&
                      (editingGoal.color || "bg-red-500") === goalColor)
                  }
                  onClick={async () => {
                    if (!goalName.trim() || !goalTarget || !user || !monthKey)
                      return;
                    const goalDocRef = doc(
                      db,
                      "users",
                      user.uid,
                      "goals",
                      monthKey
                    );
                    const goalDocSnap = await getDoc(goalDocRef);
                    let currentGoals = [];
                    if (goalDocSnap.exists()) {
                      currentGoals = goalDocSnap.data().goals || [];
                    }
                    if (editingGoal) {
                      // Edit in current month only
                      const updatedGoals = currentGoals.map((g) =>
                        g.name === editingGoal.name
                          ? {
                              ...g,
                              name: goalName.trim(),
                              type: goalType,
                              target: goalTarget,
                              color: goalColor
                            }
                          : g
                      );
                      await setDoc(goalDocRef, { goals: updatedGoals });
                      setGoals((prev) => ({
                        ...prev,
                        [monthKey]: updatedGoals
                      }));
                      // Update existing entries with the new goal name for current month only
                      const entryDocRef = doc(
                        db,
                        "users",
                        user.uid,
                        "entries",
                        monthKey
                      );
                      const entryDocSnap = await getDoc(entryDocRef);
                      let updatedEntries = {};
                      if (entryDocSnap.exists()) {
                        const oldEntries = entryDocSnap.data().entries || {};
                        Object.entries(oldEntries).forEach(
                          ([date, entryArr]) => {
                            if (Array.isArray(entryArr)) {
                              updatedEntries[date] = entryArr.map((e) =>
                                e.name === editingGoal.name
                                  ? {
                                      ...e,
                                      name: goalName.trim(),
                                      type: goalType
                                    }
                                  : e
                              );
                            } else if (Array.isArray(entryArr?.goals)) {
                              updatedEntries[date] = {
                                ...entryArr,
                                goals: entryArr.goals.map((e) =>
                                  e.name === editingGoal.name
                                    ? {
                                        ...e,
                                        name: goalName.trim(),
                                        type: goalType
                                      }
                                    : e
                                )
                              };
                            } else {
                              updatedEntries[date] = entryArr;
                            }
                          }
                        );
                        await setDoc(entryDocRef, { entries: updatedEntries });
                        setEntries(updatedEntries);
                      }
                    } else {
                      const newGoal = {
                        name: goalName.trim(),
                        type: goalType,
                        target: goalTarget,
                        color: goalColor
                      };
                      const newGoals = [...currentGoals, newGoal];
                      await setDoc(goalDocRef, { goals: newGoals });
                      setGoals((prev) => ({
                        ...prev,
                        [monthKey]: newGoals
                      }));
                    }
                    resetGoalForm();
                  }}
                  className={`${styles.button.primary} ${
                    !goalName.trim() ||
                    !goalTarget ||
                    (editingGoal &&
                      editingGoal.name === goalName.trim() &&
                      editingGoal.type === goalType &&
                      (editingGoal.target || "") === goalTarget &&
                      (editingGoal.color || styles.button.goal) === goalColor)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {editingGoal ? "수정" : "등록"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Entry Modal */}
        {showEntryModal && selectedDate && (
          <div className={styles.modal}>
            <div className={`${styles.modalContent} max-w-md w-full`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {`${format(selectedDate, "M월 d일")}은 어떤 하루였나요?`}
                </h3>
                <button
                  onClick={() => setShowEntryModal(false)}
                  className={styles.button.icon}
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("entry")}
                  className={`px-4 py-2 text-sm rounded ${
                    activeTab === "entry"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  달성 내용
                </button>
                <button
                  onClick={() => setActiveTab("mood")}
                  className={`px-4 py-2 text-sm rounded ${
                    activeTab === "mood"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  감정 기록
                </button>
              </div>
              {activeTab === "entry" && (
                <div className="space-y-3">
                  {currentGoals.map((goal) => (
                    <div key={goal.name} className="flex items-center gap-2">
                      <label className="text-sm w-24 flex items-center gap-2">
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
                            setEntryValues({
                              ...entryValues,
                              [goal.name]: {
                                ...goal,
                                value: e.target.checked
                              }
                            })
                          }
                          className="w-5 h-5"
                        />
                      ) : (
                        <input
                          type="number"
                          placeholder="분 단위로 입력하세요"
                          value={entryValues[goal.name]?.value || ""}
                          onChange={(e) =>
                            setEntryValues({
                              ...entryValues,
                              [goal.name]: {
                                ...goal,
                                value: e.target.value
                              }
                            })
                          }
                          className={styles.input}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "mood" && (
                <div>
                  <label className="text-sm text-gray-700 font-medium mb-2 block">
                    오늘의 감정 상태
                  </label>
                  <div className="flex justify-center gap-2 text-2xl mb-2">
                    {moodIcons.map((icon, score) => (
                      <button
                        key={score}
                        className={`px-1 ${
                          moodScore === score
                            ? "ring-2 ring-blue-500 rounded"
                            : ""
                        }`}
                        onClick={() => setMoodScore(score)}
                        type="button"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <textarea
                    maxLength={200}
                    placeholder="오늘 느낀 감정을 간단히 적어보세요"
                    className={`${styles.input} w-full h-24`}
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowEntryModal(false)}
                  className={styles.button.secondary}
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    // Only validate number goals, not moodNote
                    for (const entry of Object.values(entryValues)) {
                      if (entry.type === "number") {
                        const val = parseInt(entry.value, 10);
                        if (isNaN(val) || Number(entry.value) !== val) {
                          alert("숫자 목표는 정수만 입력할 수 있습니다.");
                          return;
                        }
                      }
                    }

                    if (!user || !monthKey || !selectedDate) return;
                    const entryDocRef = doc(
                      db,
                      "users",
                      user.uid,
                      "entries",
                      monthKey
                    );
                    // Always pull latest entries for month before writing
                    let currentEntries = {};
                    const entryDocSnap = await getDoc(entryDocRef);
                    if (entryDocSnap.exists()) {
                      currentEntries = entryDocSnap.data().entries || {};
                    }
                    const newEntry = {
                      goals: Object.values(entryValues),
                      moodScore,
                      moodNote
                    };
                    const updatedEntries = {
                      ...currentEntries,
                      [selectedDate]: newEntry
                    };
                    await setDoc(entryDocRef, { entries: updatedEntries });
                    setEntries(updatedEntries);
                    setShowEntryModal(false);
                  }}
                  className={styles.button.primary}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
