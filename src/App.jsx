/** @format */

/** @format */

import { useEffect, useState, useRef } from "react";
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
  Pencil,
  ChevronLeft,
  ChevronRight
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
  // 목표 현황 아코디언 상태 (모바일은 기본 접힘, 데스크톱은 기본 펼침)
  const [goalsAccordionOpen, setGoalsAccordionOpen] = useState(true);
  // 목표별 월간 현황 아코디언 상태 (모바일은 기본 접힘, 데스크톱은 기본 펼침)
  const [goalSummaryAccordionOpen, setGoalSummaryAccordionOpen] = useState(true);
  // 1. 상태 추가
  const [accordionDate, setAccordionDate] = useState(null); // 모바일 아코디언으로 펼쳐진 날짜
  const [accordionEditMode, setAccordionEditMode] = useState(false); // 수정 모드 여부
  const [modalDate, setModalDate] = useState(null); // 모달에서 편집할 날짜
  const [isAccordionClosing, setIsAccordionClosing] = useState(false); // 아코디언 닫기 애니메이션 상태

  // 날짜 계산 변수들을 먼저 선언
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();

  // App 컴포넌트 최상위에 추가
  const weekRowRefs = useRef([]); // 주별 row ref
  const cellRefs = useRef({}); // 날짜별 셀 ref
  const [tailLeft, setTailLeft] = useState("50%");

  // 모바일 아코디언 꼬리 위치 계산
  useEffect(() => {
    if (!accordionDate || window.innerWidth >= 640) return; // 데스크탑에서는 실행하지 않음
    // 주 인덱스, 셀 인덱스 찾기
    let weekIdx = -1,
      cellIdx = -1;
    const totalCells = startDay + daysInMonth;
    let idx = 0;
    outer: for (let w = 0; w < Math.ceil(totalCells / 7); w++) {
      for (let d = 0; d < 7; d++) {
        if (idx < totalCells) {
          const day = idx - startDay + 1;
          const dateStr = currentDate.date(day).format("YYYY-MM-DD");
          if (dateStr === accordionDate) {
            weekIdx = w;
            cellIdx = d;
            break outer;
          }
        }
        idx++;
      }
    }
    if (
      weekIdx !== -1 &&
      cellIdx !== -1 &&
      weekRowRefs.current[weekIdx] &&
      cellRefs.current[accordionDate]
    ) {
      const cell = cellRefs.current[accordionDate];
      const weekRow = weekRowRefs.current[weekIdx];
      const cellRect = cell.getBoundingClientRect();
      const rowRect = weekRow.getBoundingClientRect();
      setTailLeft(`${cellRect.left - rowRect.left + cellRect.width / 2}px`);
    }
  }, [accordionDate, currentDate, startDay, daysInMonth]);

  // 화면 크기에 따른 아코디언 기본 상태 설정
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 640;
      setGoalsAccordionOpen(true); // 모바일에서도 기본값 펼치기
      setGoalSummaryAccordionOpen(isDesktop);
    };
    
    // 초기 설정
    handleResize();
    
    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 아코디언 닫기 함수
  const closeAccordion = () => {
    if (window.innerWidth < 640) {
      // 아코디언이 닫히기 전에 현재 위치 저장
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 닫기 애니메이션 시작
      setIsAccordionClosing(true);
      
      // 애니메이션 완료 후 상태 초기화
      setTimeout(() => {
        setAccordionDate(null);
        setAccordionEditMode(false);
        setIsAccordionClosing(false);
        
        // 아코디언이 닫힌 후 스크롤 위치 조정
        setTimeout(() => {
          window.scrollTo({
            top: Math.max(0, currentScrollTop - 200), // 200px 위로 스크롤
            behavior: 'smooth'
          });
        }, 100);
      }, 500); // 닫기 애니메이션 시간
    } else {
      setAccordionDate(null);
      setAccordionEditMode(false);
    }
  };

  // 아코디언이 열릴 때 자동 스크롤 처리
  useEffect(() => {
    if (accordionDate && window.innerWidth < 640) {
      // 아코디언이 렌더링된 후 스크롤 처리
      setTimeout(() => {
        const accordionElement = document.querySelector('.calendar-accordion-card');
        if (accordionElement) {
          const accordionRect = accordionElement.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          // 아코디언 하단이 화면에 보이도록 스크롤 + 여유 공간 추가
          const targetScrollTop = scrollTop + accordionRect.bottom - windowHeight + 100;
          
          window.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }, 100); // 아코디언 애니메이션이 시작된 후 스크롤
    }
  }, [accordionDate]);

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

  // Goal 추가 함수
  const addGoal = async (newGoal) => {
    if (!user || !monthKey) return;
    const goalDocRef = doc(db, "users", user.uid, "goals", monthKey);
    const goalDocSnap = await getDoc(goalDocRef);
    let currentGoals = [];
    if (goalDocSnap.exists()) {
      currentGoals = goalDocSnap.data().goals || [];
    }
    const updatedGoals = [...currentGoals, newGoal];
    await setDoc(goalDocRef, { goals: updatedGoals });
    setGoals((prev) => ({ ...prev, [monthKey]: updatedGoals }));
  };

  // Goal 수정 함수
  const updateGoal = async (oldName, updatedGoal) => {
    if (!user || !monthKey) return;
    const goalDocRef = doc(db, "users", user.uid, "goals", monthKey);
    const goalDocSnap = await getDoc(goalDocRef);
    let currentGoals = [];
    if (goalDocSnap.exists()) {
      currentGoals = goalDocSnap.data().goals || [];
    }
    const updatedGoals = currentGoals.map((goal) =>
      goal.name === oldName ? { ...goal, ...updatedGoal } : goal
    );
    await setDoc(goalDocRef, { goals: updatedGoals });
    setGoals((prev) => ({ ...prev, [monthKey]: updatedGoals }));
  };

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

  // 캘린더 셀을 주(week) 단위로 그룹화하여 렌더링
  const renderCalendarRows = () => {
    const rows = [];
    // 전체 셀 수 = 첫 주 빈 셀 + 월의 날짜 수 + 마지막 주 빈 셀
    const totalCells = startDay + daysInMonth + (7 - ((startDay + daysInMonth) % 7)) % 7;
    const weeks = Math.ceil(totalCells / 7);
    let cellIdx = 0;
    for (let w = 0; w < weeks; w++) {
      const weekCells = [];
      for (let d = 0; d < 7; d++) {
        const day = cellIdx - startDay + 1;
        const isCurrentMonth = cellIdx >= startDay && day > 0 && day <= daysInMonth;
        const dateStr = isCurrentMonth ? currentDate.date(day).format("YYYY-MM-DD") : "";
        const todayStr = dayjs().format("YYYY-MM-DD");
        const isToday = dateStr === todayStr;
        const isFuture = dayjs(dateStr).isAfter(todayStr);
        
        if (isCurrentMonth) {
          weekCells.push(
            <div
              key={cellIdx}
              className={[
                styles.calendarCellMobileWrapper,
                "calendar-cell w-full",
                isFuture
                  ? "bg-gray-100 cursor-not-allowed"
                  : isToday
                    ? styles.todayCell
                    : selectedDate === dateStr
                    ? styles.selectedCell
                    : "cursor-pointer"
              ].join(" ")}
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 버블링 방지
                if (isFuture) return;
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
                if (window.innerWidth >= 640) {
                  setModalDate(dateStr);
                  setShowEntryModal(true);
                } else {
                  // 모바일 아코디언 로직
                  setAccordionDate(dateStr);
                  setAccordionEditMode(false);
                }
              }}
            >
              {isCurrentMonth && (
                <>
                  {/* 모바일: 목표 색상바 오버레이 + 날짜 숫자 */}
                  <div className="block sm:hidden w-full h-full">
                    <div className={styles.calendarGoalBarMobileOverlay}>
                      {currentGoals.map((goal, idx) => {
                        const entryData = entries[dateStr];
                        const entryArr = getEntryArray(entryData);
                        const entry = entryArr.find(
                          (e) => e.name === goal.name
                        );
                        const achieved =
                          goal.type === "checkbox"
                            ? entry?.value
                            : entry && entry.value && Number(entry.value) > 0;
                        const total = currentGoals.length;
                        const top = (idx / total) * 100;
                        const height = 100 / total;
                        
                        // 선택된 날짜일 때 아코디언 배경색과 동일하게 변경
                        const isSelectedDate = dateStr === accordionDate;
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
                        const entry = entryArr.find(
                          (e) => e.name === goal.name
                        );
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
                </>
              )}
            </div>
          );
        } else {
          // 빈 셀 추가 (첫 주의 앞부분 또는 마지막 주의 뒷부분)
          weekCells.push(
            <div 
              key={`empty-${w}-${d}`} 
              className="w-full"
            />
          );
        }
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
      
      // 주(week) 렌더링 - 아코디언이 열려있으면 통합 영역으로 감싸기
      if (showAccordion && accordionDate) {
        // 선택된 날짜의 위치 계산
        const selectedDay = dayjs(accordionDate).date();
        const selectedDayInWeek = (selectedDay + startDay - 1) % 7;
        const cellLeft = `calc(14.2857% * ${selectedDayInWeek})`;
        
        rows.push(
          <div
            key={`week-accordion-${w}`}
            className="relative sm:hidden"
            style={{ marginBottom: "8px" }}
          >
            {/* 주(week) 렌더링 */}
            <div
              className={styles.calendarWeekRow}
              style={{ position: "relative" }}
              ref={(el) => (weekRowRefs.current[w] = el)}
            >
              {weekCells}
            </div>
            
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
                          onClick={async () => {
                            // Only validate number goals, not moodNote
                            for (const entry of Object.values(entryValues)) {
                              if (entry.type === "number") {
                                const val = parseInt(entry.value, 10);
                                if (isNaN(val) || Number(entry.value) !== val) {
                                  alert(
                                    "숫자 목표는 정수만 입력할 수 있습니다."
                                  );
                                  return;
                                }
                              }
                            }
                            if (!user || !monthKey || !accordionDate) return;
                            const entryDocRef = doc(
                              db,
                              "users",
                              user.uid,
                              "entries",
                              monthKey
                            );
                            let currentEntries = {};
                            const entryDocSnap = await getDoc(entryDocRef);
                            if (entryDocSnap.exists()) {
                              currentEntries =
                                entryDocSnap.data().entries || {};
                            }
                            const newEntry = {
                              goals: Object.values(entryValues),
                              moodScore,
                              moodNote
                            };
                            const updatedEntries = {
                              ...currentEntries,
                              [accordionDate]: newEntry
                            };
                            await setDoc(entryDocRef, {
                              entries: updatedEntries
                            });
                            setEntries(updatedEntries);
                            setAccordionEditMode(false);
                            closeAccordion();
                          }}
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
      } else {
        // 아코디언이 열려있지 않을 때 일반적인 주 렌더링
        rows.push(
          <div
            key={`week-${w}`}
            className={styles.calendarWeekRow}
            style={{ position: "relative", marginBottom: "8px" }}
            ref={(el) => (weekRowRefs.current[w] = el)}
          >
            {weekCells}
          </div>
        );
      }
    }
    return rows;
  };

  // 목표별 월간 현황 테이블 렌더 함수 (per-month goals)
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
              className="inline-flex items-center text-gray-500 hover:text-blue-500 transition-colors"
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
                  const { label, percent } = getGoalProgress(goal);
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
              setAccordionDate(null);
              setAccordionEditMode(false);
              return false;
            }
          }}
        >
          {renderCalendarRows()}
        </div>
        {/* 목표별 월간 현황 */}
        <div style={{ marginTop: '16px' }}>
          {renderGoalSummary()}
        </div>

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
                {/* 이름 */}
                <div className={styles.flex.gap2}>
                  <label className="w-20 text-sm text-gray-700">이름</label>
                  <input
                    type="text"
                    placeholder="예: 운동"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className={`${styles.input} flex-1`}
                  />
                </div>
                
                {/* 목표 유형 */}
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
                
                {/* 체크박스 타입일 때만 월간 목표일수 표시 */}
                {goalType === "checkbox" && (
                  <div className={styles.flex.gap2}>
                    <label className="w-20 text-sm text-gray-700">월간 목표일수</label>
                    <input
                      type="number"
                      placeholder="예: 20"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className={`${styles.input} flex-1`}
                    />
                  </div>
                )}
                
                {/* 숫자 타입일 때만 목표 값 표시 */}
                {goalType === "number" && (
                  <div className={styles.flex.gap2}>
                    <label className="w-20 text-sm text-gray-700">목표 값</label>
                    <input
                      type="number"
                      placeholder="예: 30"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className={`${styles.input} flex-1`}
                    />
                  </div>
                )}
                
                {/* 색상 선택 */}
                <div className="space-y-2">
                  <label className="block text-sm text-gray-700">색상</label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                          goalColor === color.class 
                            ? 'border-black scale-110' 
                            : 'border-transparent hover:scale-105'
                        }`}
                        onClick={() => setGoalColor(color.class)}
                        aria-label={color.label}
                      />
                    ))}
                  </div>
                </div>
                
                {/* 버튼 */}
                <div className="flex justify-end gap-2 pt-4">
                  {editingGoal && (
                    <button
                      onClick={() => {
                        if (window.confirm("정말로 이 목표를 삭제하시겠습니까?")) {
                          deleteGoal(editingGoal);
                          resetGoalForm();
                        }
                      }}
                      className={styles.button.danger}
                    >
                      삭제
                    </button>
                  )}
                  <button
                    onClick={resetGoalForm}
                    className={styles.button.secondary}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
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
                      setShowGoalModal(false);
                    }}
                    className={styles.button.primary}
                  >
                    {editingGoal ? "수정" : "등록"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entry Modal (데스크탑 전용) */}
        {showEntryModal && modalDate && (
          <div className={styles.modal}>
            <div className={`${styles.modalContent} ${styles.cardSmall}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={styles.text.title}>
                  {dayjs(modalDate).format("M월 D일")} 일정 입력
                </h3>
                <button
                  onClick={() => {
                    setShowEntryModal(false);
                    setModalDate(null);
                  }}
                  className={styles.button.icon}
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                        onClick={() => setMoodScore(score)}
                        type="button"
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
                    onChange={(e) => setMoodNote(e.target.value)}
                    rows={4}
                    style={{ resize: "none" }}
                  />
                </div>
                {/* 목표별 달성 입력 */}
                <div className="space-y-3">
                  {currentGoals.map((goal) => (
                    <div key={goal.name} className="flex items-center gap-2">
                      <label className="text-sm flex items-center gap-2 flex-1">
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
                {/* 버튼 영역 */}
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => {
                      setShowEntryModal(false);
                      setModalDate(null);
                    }}
                    className={styles.button.secondary}
                  >
                    닫기
                  </button>
                  <button
                    onClick={async () => {
                      // Only validate number goals, not moodNote
                      for (const entry of Object.values(entryValues)) {
                        if (entry.type === "number") {
                          const val = parseInt(entry.value, 10);
                          if (isNaN(val) || Number(entry.value) !== val) {
                            alert(
                              "숫자 목표는 정수만 입력할 수 있습니다."
                            );
                            return;
                          }
                        }
                      }
                      if (!user || !monthKey || !modalDate) return;
                      const entryDocRef = doc(
                        db,
                        "users",
                        user.uid,
                        "entries",
                        monthKey
                      );
                      let currentEntries = {};
                      const entryDocSnap = await getDoc(entryDocRef);
                      if (entryDocSnap.exists()) {
                        currentEntries =
                          entryDocSnap.data().entries || {};
                      }
                      const newEntry = {
                        goals: Object.values(entryValues),
                        moodScore,
                        moodNote
                      };
                      const updatedEntries = {
                        ...currentEntries,
                        [modalDate]: newEntry
                      };
                      await setDoc(entryDocRef, {
                        entries: updatedEntries
                      });
                      setEntries(updatedEntries);
                      setShowEntryModal(false);
                      setModalDate(null);
                    }}
                    className={styles.button.primary}
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 날짜별 입력 아코디언 */}
        {/* This block is now rendered inside renderCalendarRows */}
      </div>
    </div>
  );
}

export default App;
