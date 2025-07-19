import { useState, useEffect } from "react";

export const useAccordion = () => {
  const [accordionDate, setAccordionDate] = useState(null);
  const [accordionEditMode, setAccordionEditMode] = useState(false);
  const [isAccordionClosing, setIsAccordionClosing] = useState(false);

  // 아코디언 닫기 함수
  const closeAccordion = () => {
    // 닫기 애니메이션 시작
    setIsAccordionClosing(true);
    
    // 애니메이션 완료 후 상태 초기화 (딜레이 없이 즉시)
    setTimeout(() => {
      setAccordionDate(null);
      setAccordionEditMode(false);
      setIsAccordionClosing(false);
    }, 500); // 닫기 애니메이션 시간
  };

  // 아코디언 열기 함수
  const openAccordion = (dateStr) => {
    setAccordionDate(dateStr);
    setAccordionEditMode(false);
    setIsAccordionClosing(false);
  };

  // 아코디언이 열릴 때 자동 스크롤 처리 (제거됨)
  // useEffect(() => {
  //   if (accordionDate && window.innerWidth < 640) {
  //     // 아코디언이 렌더링된 후 스크롤 처리
  //     setTimeout(() => {
  //       const accordionElement = document.querySelector('.calendar-accordion-card');
  //       if (accordionElement) {
  //         const accordionRect = accordionElement.getBoundingClientRect();
  //         const windowHeight = window.innerHeight;
  //         const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  //         
  //         // 아코디언 하단이 화면에 보이도록 스크롤 + 여유 공간 추가
  //         const targetScrollTop = scrollTop + accordionRect.bottom - windowHeight + 100;
  //         
  //         window.scrollTo({
  //           top: targetScrollTop,
  //           behavior: 'smooth'
  //         });
  //       }
  //     }, 100); // 아코디언 애니메이션이 시작된 후 스크롤
  //   }
  // }, [accordionDate]);

  return {
    accordionDate,
    setAccordionDate,
    accordionEditMode,
    setAccordionEditMode,
    isAccordionClosing,
    setIsAccordionClosing,
    closeAccordion,
    openAccordion
  };
}; 