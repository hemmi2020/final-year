/**
 * Preference Engine — loads user preferences and provides defaults
 * Injects preferences into all service calls
 */

const DEFAULT_PREFERENCES = {
    dietary: [],
    budget: 'moderate',
    preferredCurrency: 'USD',
    temperatureUnit: 'metric',
    interests: [],
    travelStyle: 'solo',
};

/**
 * Get merged preferences (user stored + request overrides)
 */
exports.getPreferences = (user, requestOverrides = {}) => {
    const stored = user?.preferences || {};

    return {
        dietary: requestOverrides.dietary || stored.dietary || DEFAULT_PREFERENCES.dietary,
        budget: requestOverrides.budget || stored.budget || DEFAULT_PREFERENCES.budget,
        preferredCurrency: requestOverrides.preferredCurrency || stored.preferredCurrency || DEFAULT_PREFERENCES.preferredCurrency,
        temperatureUnit: requestOverrides.temperatureUnit || stored.temperatureUnit || DEFAULT_PREFERENCES.temperatureUnit,
        interests: requestOverrides.interests || stored.interests || DEFAULT_PREFERENCES.interests,
        travelStyle: requestOverrides.travelStyle || stored.travelStyle || DEFAULT_PREFERENCES.travelStyle,
    };
};

/**
 * Build search tags from preferences (for Graph RAG)
 */
exports.buildSearchTags = (preferences) => {
    const tags = [...(preferences.dietary || []), ...(preferences.interests || [])];
    if (preferences.budget) tags.push(preferences.budget);
    if (preferences.travelStyle === 'family') tags.push('family-friendly');
    return [...new Set(tags)];
};

exports.DEFAULT_PREFERENCES = DEFAULT_PREFERENCES;
