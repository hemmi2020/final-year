/**
 * Utility function to merge class names
 * Combines multiple class names and handles conditional classes
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

/**
 * Utility function to format currency
 */
export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

/**
 * Utility function to format date
 */
export function formatDate(date, options = {}) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    }).format(new Date(date));
}

/**
 * Utility function to truncate text
 */
export function truncate(text, length = 100) {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}
