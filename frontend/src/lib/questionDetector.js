/**
 * QuestionDetector module
 *
 * Detects what the AI is ASKING the user for, based on the last sentence/question.
 * Only triggers on actual questions — not statements containing keywords.
 *
 * Strategy: Extract the LAST question from the text, then match against specific patterns.
 */

const QUESTION_PATTERNS = [
    {
        type: 'destination',
        // Only match when AI is clearly asking WHERE to go
        patterns: [
            /where (?:would you|do you|are you).+(?:go|visit|travel)/i,
            /which (?:city|destination|country|place)/i,
            /where.+like to (?:go|visit|travel)/i,
            /tell me.+destination/i,
            /what.+destination/i,
        ],
    },
    {
        type: 'preferences',
        // Match when AI asks about interests, activities, preferences
        patterns: [
            /(?:interests|preferences).+(?:activit|trip|travel)/i,
            /(?:share|tell).+(?:interests|preferences)/i,
            /what (?:kind|type) of (?:activit|experience|thing)/i,
            /(?:interested in|prefer|enjoy).+(?:\?|trip|travel|activit)/i,
            /(?:historical|shopping|nature|food|adventure|culture).+(?:or|,).+(?:\?)/i,
        ],
    },
    {
        type: 'companions',
        // Match when AI asks about who is traveling
        patterns: [
            /(?:who|whom).+travel(?:ing|l) with/i,
            /(?:solo|alone|partner|friends|family).+(?:trip|travel|vacation)\?/i,
            /travel(?:ing|l).+(?:solo|alone|with|companion)/i,
            /(?:who are you|are you).+travel(?:ing|l)/i,
        ],
    },
    {
        type: 'duration',
        // Only match when AI is specifically asking HOW LONG
        patterns: [
            /how (?:long|many days|many nights)/i,
            /(?:duration|length) of (?:your|the|this) (?:trip|stay|visit)/i,
            /how long.+(?:plan|stay|visit|trip)/i,
        ],
    },
    {
        type: 'budget',
        // Only match when AI is asking about budget/spending
        patterns: [
            /(?:what|how much).+budget/i,
            /budget.+(?:range|level|preference)/i,
            /how much.+(?:spend|willing|plan)/i,
            /(?:budget|mid-range|luxury).+(?:prefer|\?)/i,
        ],
    },
    {
        type: 'generate',
        // Match when AI is ready to create the itinerary
        patterns: [
            /shall I (?:create|generate|build|plan)/i,
            /(?:ready to|let me) (?:create|generate|build|plan)/i,
            /would you like me to (?:create|generate|plan)/i,
            /(?:create|generate).+(?:itinerary|plan) for you/i,
            /based on (?:your|these|all) (?:preferences|details|information)/i,
        ],
    },
];

/**
 * Detects if the AI response is asking a specific travel-planning question.
 * Only looks at the LAST question in the text to avoid false positives.
 *
 * @param {string} text - AI response text to analyze
 * @returns {{ type: string, context: string } | null}
 */
export function detectQuestion(text) {
    if (!text || typeof text !== 'string') return null;

    // Extract the last 2 sentences (where the question usually is)
    const sentences = text.split(/[.!]\s+/);
    const lastPart = sentences.slice(-3).join('. ');

    // Must contain a question mark or question-like phrasing to be a question
    const hasQuestion = lastPart.includes('?') ||
        /(?:could you|would you|can you|please|tell me|share|what|how|where|which|who)/i.test(lastPart);

    if (!hasQuestion) return null;

    for (const { type, patterns } of QUESTION_PATTERNS) {
        for (const pattern of patterns) {
            const match = lastPart.match(pattern);
            if (match) {
                return { type, context: match[0] };
            }
        }
    }

    return null;
}
