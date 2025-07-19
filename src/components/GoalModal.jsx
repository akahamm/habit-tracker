import { X } from "lucide-react";
import styles from "../styles";
import { colorOptions } from "../styles";

const GoalModal = ({
  showGoalModal,
  editingGoal,
  goalName,
  setGoalName,
  goalType,
  setGoalType,
  goalTarget,
  setGoalTarget,
  goalColor,
  setGoalColor,
  onSave,
  onDelete,
  onClose
}) => {
  if (!showGoalModal) return null;

  return (
    <div className={styles.modal}>
      <div className={`${styles.modalContent} ${styles.cardSmall}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={styles.text.title}>
            {editingGoal ? "목표 수정" : "목표 등록"}
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
                onClick={onDelete}
                className={styles.button.danger}
              >
                삭제
              </button>
            )}
            <button
              onClick={onClose}
              className={styles.button.secondary}
            >
              취소
            </button>
            <button
              onClick={onSave}
              className={styles.button.primary}
            >
              {editingGoal ? "수정" : "등록"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalModal; 