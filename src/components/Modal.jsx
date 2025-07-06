/** @format */
import styles, { colorOptions } from "../styles";

// Modal.jsx
const Modal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "확인",
  cancelText = "취소"
}) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onConfirm} className={styles.button.danger}>
          {confirmText}
        </button>
        <button onClick={onCancel} className={styles.button.secondary}>
          {cancelText}
        </button>
      </div>
    </div>
  </div>
);

export default Modal;
