import { useEffect, useRef, useState, type CSSProperties } from 'react';

const GLOBAL_HEADER_HEIGHT = 53;

export function useStickyListingHeader(topOffset = GLOBAL_HEADER_HEIGHT) {
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const [tableHeadTop, setTableHeadTop] = useState(topOffset);

  useEffect(() => {
    const headerEl = stickyHeaderRef.current;
    if (!headerEl) return;
    let raf = 0;

    const measure = () => {
      const listingEl = headerEl.closest('.sticky-listing-table');
      const scrollEl = listingEl?.querySelector('.sticky-table-scroll');
      const headerBottom = headerEl.getBoundingClientRect().bottom;

      if (scrollEl) {
        setTableHeadTop(headerBottom - scrollEl.getBoundingClientRect().top);
        return;
      }

      setTableHeadTop(topOffset + headerEl.getBoundingClientRect().height);
    };

    const scheduleMeasure = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        measure();
        raf = 0;
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(headerEl);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', scheduleMeasure, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', scheduleMeasure);
      if (raf) cancelAnimationFrame(raf);
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
