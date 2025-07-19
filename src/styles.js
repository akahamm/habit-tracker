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
      "flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-md flex items-center justify-center gap-2 transition-colors min-h-[44px]",
    danger:
      "flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-md flex items-center justify-center gap-2 transition-colors min-h-[44px]",
    secondary:
      "bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-md flex items-center justify-center transition-colors min-h-[44px]",
    reset:
      "bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-colors min-h-[44px]",
    add: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-md flex items-center gap-2 transition-colors min-h-[44px]",
    remove:
      "bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors min-w-[36px] min-h-[36px]",
    goal: "bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-xs transition-colors min-h-[36px]",
    notification:
      "bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-md transition-colors min-h-[36px]"
  },
  text: {
    title: "text-2xl font-bold text-gray-800",
    subtitle: "text-gray-600 mt-1 text-base leading-relaxed",
    large: "text-2xl font-bold text-gray-800",
    small: "text-base text-gray-600 leading-relaxed",
    time: "text-3xl font-bold leading-tight",
    xs: "text-sm text-gray-500 leading-snug"
  },
  input:
    "border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] text-base leading-relaxed",
  select:
    "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
  calendarGrid: "grid grid-cols-7 gap-2",
  calendarHeader: "text-center text-gray-700 font-semibold mb-1",
  calendarCell:
    "h-24 border rounded-md p-1 hover:bg-gray-50 cursor-pointer transition-colors relative",
  todayCell: "ring-2 ring-blue-400 bg-blue-50 border-blue-400 z-10",
  selectedCell: "ring-2 ring-green-400 bg-green-50 border-green-400 z-20",
  calendarDay: "text-base font-semibold text-gray-700 leading-tight",
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
  progressBar: "flex-1 bg-gray-200 rounded-full h-3 sm:h-4",
  progressFill: "h-3 sm:h-4 rounded-full",
  modal:
    "fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50",
  modalContent: "bg-white p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4",
  fabAddGoal:
    "fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 sm:w-16 sm:h-16 text-3xl transition-all",
  calendarCellSquareMobile:
    "aspect-square h-full w-full p-0 flex flex-col justify-between sm:p-1 sm:h-24 sm:aspect-auto",
  calendarGoalBarMobile: "flex-1 w-full transition-colors",
  calendarCellMobileWrapper:
    "relative aspect-square w-full h-full overflow-hidden flex flex-col items-center justify-center p-0 sm:p-1 sm:h-24 sm:aspect-auto",
  calendarGoalBarMobileOverlay:
    "absolute left-0 top-0 w-full h-full flex flex-col justify-stretch z-0",
  calendarDayOnBarMobile:
    "absolute top-1 left-1/2 -translate-x-1/2 text-base font-bold z-10 text-gray-900 drop-shadow-sm select-none pointer-events-none",
  calendarGridFlex: "flex flex-col gap-2 w-full",
  calendarWeekRow: "flex flex-row gap-2 w-full",
  calendarAccordionCard:
    "bg-[#f3f4f6] rounded-2xl border border-gray-200 shadow-xl p-6 max-w-md w-full relative z-20",
  calendarAccordionTail:
    "absolute w-0 h-0 left-1/2 -translate-x-1/2 -top-3 z-30 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-[#f3f4f6]",
  button: {
    icon: "text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
  }
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
