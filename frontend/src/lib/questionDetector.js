/**
 * QuestionDetector module
 *
 * Inspects AI response text and returns a detected question type or null.
 * Priority order: destination > duration > budget > preferences > companions
 */

const QUESTION_PATTERNS = [
    {
        type: 'destination',
        patterns: [
            /\bwhere\b/i,
            /\bwhich city\b/i,
            /\bdestination\b/i,
            /\bcountry\b/i,
            /\bplace to visit\b/i,
            /\bgo to\b/i,
        ],
    },
    {
        type: 'duration',
        patterns: [
            /\bhow long\b/i,
            /\bhow many days\b/i,
            /\bduration\b/i,
            /\bnights\b/i,
            /\blength of trip\b/i,
            /\bdays\b/i,
        ],
    },
    {
        type: 'budget',
        patterns: [
            /\bbudget\b/i,
            /\bhow much\b/i,
            /\bspend\b/i,
            /\bprice range\b/i,
            /\bcost\b/i,
        ],
    },
    {
        type: 'preferences',
        patterns: [
            /\binterests\b/i,
            /\bprefer\b/i,
            /\benjoy\b/i,
            /\bactivities\b/i,
            /\bwhat kind of\b/i,
            /\btype of\b/i,
        ],
    },
    {
        type: 'companions',
        patterns: [
            /\btraveling with\b/i,
            /\bwho\b/i,
            /\bsolo\b/i,
            /\bgroup\b/i,
            /\bcompanion\b/i,
            /\balone or with\b/i,
            /\btravel with\b/i,
        ],
    },
    {
        type: 'generate',
        patterns: [
            /\bready to plan\b/i,
            /\bgenerate\b/i,
            /\bcreate itinerary\b/i,
            /\blet me plan\b/i,
            /\bhere'?s what I suggest\b/i,
            /\bbased on your preferences\b/i,
            /\bshall I create\b/i,
            /\bwould you like me to plan\b/i,
        ],
    },
];

/**
 * Detects if the given text contains a travel-planning question.
 *
 * @param {string} text - AI response text to analyze
 * @returns {{ type: string, context: string } | null} Detected question info or null
 */
export function detectQuestion(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }

    for (const { type, patterns } of QUESTION_PATTERNS) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return { type, context: match[0] };
            }
        }
    }

    return null;
}
