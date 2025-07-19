import { X } from "lucide-react";
import dayjs from "dayjs";
import styles from "../styles";
import { moodIcons } from "../utils/calendarUtils";

const EntryModal = ({
  showEntryModal,
  modalDate,
  currentGoals,
  entryValues,
  setEntryValues,
  moodScore,
  setMoodScore,
  moodNote,
  setMoodNote,
  onSave,
  onClose
}) => {
  if (!showEntryModal || !modalDate) return null;

  return (
    <div className={styles.modal}>
      <div className={`${styles.modalContent} ${styles.cardSmall}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={styles.text.title}>
            {dayjs(modalDate).format("M월 D일")} 일정 입력
          </h3>
          <button
            onClick={onClose}
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
              onClick={onClose}
              className={styles.button.secondary}
            >
              닫기
            </button>
            <button
              onClick={onSave}
              className={styles.button.primary}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryModal; 