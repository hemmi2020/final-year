/**
 * Prompt templates for AI itinerary generation
 */

exports.itineraryPrompt = (context) => {
    const { destination, days, preferences, graphResults, weather, currencyRate, vectorResults, conversationHistory, flightData, hotelData, origin, travelCompanion, vibe } = context;

    let prompt = `You are an expert travel planner. Generate a detailed ${days}-day travel itinerary for ${destination}.

USER PREFERENCES:
- Dietary: ${preferences.dietary.length > 0 ? preferences.dietary.join(', ') : 'No restrictions'}
- Budget: ${preferences.budget}
- Travel Style: ${preferences.travelStyle}
- Interests: ${preferences.interests.length > 0 ? preferences.interests.join(', ') : 'General'}
- Currency: ${preferences.preferredCurrency}
- Origin: ${origin || 'Not specified'}
- Travel Companion: ${travelCompanion || 'Not specified'}
- Vibe: ${Array.isArray(vibe) && vibe.length > 0 ? vibe.join(', ') : 'General'}
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

    if (context.flightData?.length > 0) {
        prompt += `\n\nREAL FLIGHT DATA (use these actual flights in the itinerary):`;
        context.flightData.slice(0, 3).forEach(f => {
            prompt += `\n- ${f.airline}: ${f.originCode}→${f.destinationCode}, ${f.departure}, ${f.duration}, ${f.stops} stops, ${f.price}`;
        });
    }

    if (context.hotelData?.length > 0) {
        prompt += `\n\nREAL HOTEL DATA (use these actual hotels in the itinerary):`;
        context.hotelData.slice(0, 3).forEach(h => {
            prompt += `\n- ${h.name}: ${h.stars}★, rating ${h.rating}, ${h.price}, ${h.distance}`;
        });
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
  "origin": "${origin || 'Not specified'}",
  "heroImage": "https://images.unsplash.com/photo-destination-placeholder",
  "summary": { "days": ${days}, "cities": 1, "experiences": 0, "hotels": 1, "transport": "flight" },
  "route": { "origin": "${origin || 'Not specified'}", "destination": "${destination}", "startDate": "", "endDate": "" },
  "flight": { "airline": "string", "from": "string", "to": "string", "price": "string", "duration": "string", "departure": "string", "stops": 0 },
  "returnFlight": { "airline": "string", "from": "string", "to": "string", "price": "string", "duration": "string", "departure": "string", "stops": 0 },
  "hotel": { "name": "string", "stars": number, "rating": number, "pricePerNight": "string", "address": "string", "image": "" },
  "days": [
    {
      "day": 1,
      "theme": "Day theme",
      "weather": { "temp": number, "description": "string" },
      "activities": [
        {
          "time": "09:00",
          "period": "morning",
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
}

IMPORTANT: Each activity MUST have a "period" field with value "morning", "lunch", "afternoon", or "dinner".`;

    return prompt;
};

exports.chatPrompt = (message, context, tripState) => {
    let tripStateContext = '';
    if (tripState) {
        const fields = [];
        if (tripState.destination) fields.push(`Destination: ${tripState.destination}`);
        if (tripState.origin) fields.push(`Origin: ${tripState.origin}`);
        if (tripState.duration) fields.push(`Duration: ${tripState.duration}`);
        if (tripState.travelCompanion) fields.push(`Travel Companion: ${tripState.travelCompanion}`);
        if (tripState.vibe && tripState.vibe.length > 0) fields.push(`Vibe: ${Array.isArray(tripState.vibe) ? tripState.vibe.join(', ') : tripState.vibe}`);
        if (tripState.budget) fields.push(`Budget: ${tripState.budget}`);
        if (tripState.dates) fields.push(`Dates: ${tripState.dates.start || ''} to ${tripState.dates.end || ''}`);
        if (fields.length > 0) {
            tripStateContext = `\nTRIP PLANNING STATE (already collected from user — do NOT re-ask these):\n${fields.join('\n')}\n`;
        }
    }

    return `You are TravelAI, a friendly and knowledgeable travel assistant.

${context ? `CONTEXT:\n${context}\n` : ''}${tripStateContext}

RULES:
- Keep responses concise, helpful, and conversational
- Do NOT output any HTML tags, <component> tags, or structured UI markup — just plain text and markdown
- If the user asks about destinations, suggest 3-5 options as a bulleted list with emoji flags and brief descriptions
- When discussing food or restaurants, ALWAYS mention halal options if the user has halal in their preferences
- For Pakistani cities, recommend: Lahore (Cuckoo's Den, Haveli, Butt Karahi), Karachi (BBQ Tonight, Kolachi, Okra), Islamabad (Monal, Tuscany Courtyard, Savour Foods)
- Do NOT ask about trip planning steps (destination, duration, budget, companions) — the frontend handles that automatically via a state machine
- Just respond naturally to what the user says
- Always end your response with a question or suggestion

USER: ${message}`;
};
