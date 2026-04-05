'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to track scroll position
 * @returns {number} Current scroll Y position
 */
export function useScrollPosition() {
    const [scrollPosition, setScrollPosition] = useState(
        typeof window !== 'undefined' ? window.scrollY : 0
    );

    useEffect(() => {
        let timeoutId = null;

        const handleScroll = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                setScrollPosition(window.scrollY);
            }, 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    return scrollPosition;
}
