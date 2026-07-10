import { useEffect, useRef, useState, type CSSProperties } from 'react';

const GLOBAL_HEADER_HEIGHT = 53;

export function useStickyListingHeader(topOffset = GLOBAL_HEADER_HEIGHT) {
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const [tableHeadTop, setTableHeadTop] = useState(topOffset);

  useEffect(() => {
    const headerEl = stickyHeaderRef.current;
    if (!headerEl) return;

    const measure = () => {
      setTableHeadTop(topOffset + headerEl.getBoundingClientRect().height);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(headerEl);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [topOffset]);

  return {
    stickyHeaderRef,
    tableHeadTop,
    stickyTableStyle: {
      '--sticky-table-head-top': `${tableHeadTop}px`,
    } as CSSProperties,
  };
}
