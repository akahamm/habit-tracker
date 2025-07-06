/** @format */

// 스타일 클래스 정의
const styles = {
  container: "min-h-screen bg-gray-50 p-2",
  maxWidth: "w-full max-w-screen-xl mx-auto",
  card: "bg-white rounded-lg shadow-md p-6",
  cardSmall: "bg-white rounded-lg shadow-md p-4",
  cardSection: "mb-6",
  button: {
    primary:
      "flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-colors",
    danger:
      "flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-colors",
    secondary:
      "bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md flex items-center justify-center transition-colors",
    reset:
      "bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors",
    add: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors",
    remove:
      "bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors",
    goal: "bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs transition-colors",
    notification:
      "bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md transition-colors"
  },
  text: {
    title: "text-2xl font-bold text-gray-800",
    subtitle: "text-gray-600 mt-1",
    large: "text-2xl font-bold text-gray-800",
    small: "text-sm text-gray-600",
    time: "text-3xl font-bold",
    xs: "text-xs text-gray-500"
  },
  input:
    "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
  select:
    "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
  calendarGrid: "grid grid-cols-7 gap-2",
  calendarHeader: "text-center text-gray-700 font-semibold mb-1",
  calendarCell:
    "h-24 border rounded-md p-1 hover:bg-gray-50 cursor-pointer transition-colors",
  calendarDay: "text-sm font-semibold text-gray-700",
  activitiesGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6",
  statsGrid: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-4",
  flex: {
    between: "flex items-center justify-between",
    center: "flex items-center justify-center",
    gap2: "flex items-center gap-2",
    gap1: "flex items-center gap-1"
  },
  label: "block text-sm font-medium mb-1",
  activeIndicator: "flex items-center gap-1 text-green-600",
  activeDot: "w-2 h-2 bg-green-500 rounded-full animate-pulse",
  colorDot: "w-3 h-3 rounded-full",
  progressBar: "flex-1 bg-gray-200 rounded-full h-2",
  progressFill: "h-2 rounded-full",
  modal:
    "fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50",
  modalContent: "bg-white p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4"
};

// 색상 옵션
const colorOptions = [
  { name: "red", class: "bg-red-500", label: "빨강" },
  { name: "blue", class: "bg-blue-500", label: "파랑" },
  { name: "green", class: "bg-green-500", label: "초록" },
  { name: "purple", class: "bg-purple-500", label: "보라" },
  { name: "yellow", class: "bg-yellow-500", label: "노랑" },
  { name: "pink", class: "bg-pink-500", label: "분홍" },
  { name: "indigo", class: "bg-indigo-500", label: "남색" },
  { name: "orange", class: "bg-orange-500", label: "주황" }
];

export { colorOptions };
export default styles;
