import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useGoals = (user, monthKey) => {
  const [goals, setGoals] = useState({});
  const [goalColor, setGoalColor] = useState("bg-red-500");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalType, setGoalType] = useState("checkbox");
  const [goalTarget, setGoalTarget] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);

  const currentGoals = goals[monthKey] || [];

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
  };

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

  // 목표 등록/수정 모달 닫기 및 상태 초기화 함수
  const resetGoalForm = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
    setGoalName("");
    setGoalType("checkbox");
    setGoalTarget("");
    setGoalColor("bg-red-500");
  };

  return {
    goals,
    setGoals,
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
  };
}; 