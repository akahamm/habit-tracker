import { useState, useEffect } from "react";

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [goalsAccordionOpen, setGoalsAccordionOpen] = useState(true);
  const [goalSummaryAccordionOpen, setGoalSummaryAccordionOpen] = useState(true);

  // 화면 크기에 따른 아코디언 기본 상태 설정
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 640;
      setIsMobile(!isDesktop);
      setGoalsAccordionOpen(true); // 모바일에서도 기본값 펼치기
      setGoalSummaryAccordionOpen(isDesktop);
    };
    
    // 초기 설정
    handleResize();
    
    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    goalsAccordionOpen,
    setGoalsAccordionOpen,
    goalSummaryAccordionOpen,
    setGoalSummaryAccordionOpen
  };
}; 