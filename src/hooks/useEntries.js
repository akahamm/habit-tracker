import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useEntries = (user, monthKey) => {
  const [entries, setEntries] = useState({});
  const [entryValues, setEntryValues] = useState({});
  const [moodScore, setMoodScore] = useState(null);
  const [moodNote, setMoodNote] = useState("");

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

  // entryValues 처리 함수
  const getEntryArray = (entryData) => {
    return Array.isArray(entryData)
      ? entryData
      : Array.isArray(entryData?.goals)
      ? entryData.goals
      : [];
  };

  // 엔트리 저장 함수
  const saveEntry = async (date, entryData) => {
    if (!user || !monthKey) return;
    const entryDocRef = doc(db, "users", user.uid, "entries", monthKey);
    let currentEntries = {};
    const entryDocSnap = await getDoc(entryDocRef);
    if (entryDocSnap.exists()) {
      currentEntries = entryDocSnap.data().entries || {};
    }
    const updatedEntries = {
      ...currentEntries,
      [date]: entryData
    };
    await setDoc(entryDocRef, { entries: updatedEntries });
    setEntries(updatedEntries);
  };

  // 엔트리 초기화 함수
  const resetEntryForm = () => {
    setEntryValues({});
    setMoodScore(null);
    setMoodNote("");
  };

  return {
    entries,
    setEntries,
    entryValues,
    setEntryValues,
    moodScore,
    setMoodScore,
    moodNote,
    setMoodNote,
    getEntryArray,
    saveEntry,
    resetEntryForm
  };
}; 