'use client';

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/lib/constants';

/**
 * Hook to detect viewport width breakpoints
 * @returns {Object} Boolean flags for each breakpoint
 */
export function useMediaQuery() {
    const [breakpoints, setBreakpoints] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: false,
    });

    useEffect(() => {
        const updateBreakpoints = () => {
            const width = window.innerWidth;
            setBreakpoints({
                isMobile: width < BREAKPOINTS.md,
                isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
                isDesktop: width >= BREAKPOINTS.lg,
            });
        };

        // Set initial values
        updateBreakpoints();

        // Add event listener
        window.addEventListener('resize', updateBreakpoints);

        return () => window.removeEventListener('resize', updateBreakpoints);
    }, []);

    return breakpoints;
}
