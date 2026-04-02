/**
 * Prompt templates for AI itinerary generation
 */

exports.itineraryPrompt = (context) => {
    const { destination, days, preferences, graphResults, weather, currencyRate, vectorResults, conversationHistory } = context;

    let prompt = `You are an expert travel planner. Generate a detailed ${days}-day travel itinerary for ${destination}.

USER PREFERENCES:
- Dietary: ${preferences.dietary.length > 0 ? preferences.dietary.join(', ') : 'No restrictions'}
- Budget: ${preferences.budget}
- Travel Style: ${preferences.travelStyle}
- Interests: ${preferences.interests.length > 0 ? preferences.interests.join(', ') : 'General'}
- Currency: ${preferences.preferredCurrency}
`;

    if (graphResults && (graphResults.restaurants?.length > 0 || graphResults.attractions?.length > 0)) {
        prompt += `\nKNOWLEDGE GRAPH DATA (verified places):`;
        if (graphResults.restaurants?.length > 0) {
            prompt += `\nRestaurants: ${graphResults.restaurants.map(r => `${r.name} (rating: ${r.rating}, tags: ${r.tags?.join(', ')})`).join('; ')}`;
        }
        if (graphResults.attractions?.length > 0) {
            prompt += `\nAttractions: ${graphResults.attractions.map(a => `${a.name} (type: ${a.type}, rating: ${a.rating}, tags: ${a.tags?.join(', ')})`).join('; ')}`;
        }
    }

    if (weather) {
        prompt += `\n\nWEATHER: Current temp ${weather.temp}°, ${weather.description}. Plan indoor activities for rainy days.`;
    }

    if (currencyRate) {
        prompt += `\nCURRENCY: 1 ${currencyRate.from} = ${currencyRate.rate} ${currencyRate.to}. Show all costs in ${preferences.preferredCurrency}.`;
    }

    if (vectorResults?.length > 0) {
        prompt += `\n\nRELATED RECOMMENDATIONS: ${vectorResults.map(v => v.text || v.name).join('; ')}`;
    }

    if (conversationHistory?.length > 0) {
        prompt += `\n\nPREVIOUS CONVERSATION CONTEXT: The user has been discussing travel plans. Consider their earlier messages.`;
    }

    prompt += `

RESPOND IN JSON FORMAT:
{
  "title": "Trip title",
  "destination": "${destination}",
  "days": [
    {
      "day": 1,
      "theme": "Day theme",
      "weather": { "temp": number, "description": "string" },
      "activities": [
        {
          "time": "09:00",
          "name": "Activity name",
          "description": "Brief description",
          "type": "attraction|restaurant|transport|hotel",
          "cost": { "amount": number, "currency": "${preferences.preferredCurrency}" },
          "tags": ["tag1", "tag2"]
        }
      ]
    }
  ],
  "totalBudget": { "amount": number, "currency": "${preferences.preferredCurrency}" },
  "tips": ["tip1", "tip2"]
}`;

    return prompt;
};

exports.chatPrompt = (message, context) => {
    return `You are TravelAI, a friendly and knowledgeable travel assistant. Help the user plan their trip.

${context ? `CONTEXT:\n${context}\n` : ''}
USER: ${message}

Respond helpfully. If the user asks about a specific destination, provide practical advice. If they want an itinerary, ask for destination, duration, and preferences if not provided.`;
};
