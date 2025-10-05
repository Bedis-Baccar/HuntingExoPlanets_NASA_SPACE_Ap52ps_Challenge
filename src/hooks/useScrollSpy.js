import { useEffect, useState } from 'react';

/**
 * useScrollSpy
 * Observes sections (querySelectorAll for 'section[id]') and returns currently active section id.
 * Options allow threshold tuning and rootMargin to bias activation earlier or later.
 * Accessibility: caller can set aria-current="page" on matching nav links.
 */
export default function useScrollSpy({
  selector = 'section[id]',
  root = null,
  rootMargin = '0px 0px -45% 0px',
  threshold = 0.25,
  initial = undefined,
} = {}) {
  const [activeId, setActiveId] = useState(initial);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(selector));
    if (!elements.length) return;

    let current = activeId;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id && id !== current) {
            current = id;
            setActiveId(id);
          }
        }
      });
    }, { root, rootMargin, threshold });

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selector, root, rootMargin, threshold]);

  return activeId;
}
