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

IMPORTANT: Group activities within each day by time-of-day period. Each activity MUST include a "period" field with one of: "morning", "lunch", "afternoon", "dinner". Order activities within each day by period: morning first, then lunch, then afternoon, then dinner.

RESPOND IN JSON FORMAT:
{
  "title": "Trip title",
  "destination": "${destination}",
  "origin": "${origin || ''}",
  "heroImage": "Suggest a relevant Unsplash image URL for ${destination} (e.g. https://images.unsplash.com/photo-...) or leave as empty string",
  "summary": { "days": ${days}, "cities": number, "experiences": number, "hotels": number, "transport": "flight|train|bus" },
  "route": { "origin": "${origin || ''}", "destination": "${destination}", "startDate": "ISO date string or empty", "endDate": "ISO date string or empty" },
  "flight": { "airline": "string", "from": "string", "to": "string", "departure": "string", "arrival": "string", "price": "string", "duration": "string", "stops": number, "airlineLogo": "string" },
  "returnFlight": { "airline": "string", "from": "string", "to": "string", "departure": "string", "arrival": "string", "price": "string", "duration": "string", "stops": number, "airlineLogo": "string" },
  "hotel": { "name": "string", "stars": number, "rating": number, "pricePerNight": "string", "image": "string", "address": "string", "distance": "string" },
  "days": [
    {
      "day": 1,
      "theme": "Day theme",
      "weather": { "temp": number, "description": "string" },
      "activities": [
        {
          "time": "09:00",
          "period": "morning|lunch|afternoon|dinner",
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

    return `You are TravelAI, a friendly and knowledgeable travel assistant with the ability to render rich interactive UI components.

${context ? `CONTEXT:\n${context}\n` : ''}${tripStateContext}

GENERATIVE UI INSTRUCTIONS:
When appropriate, output interactive UI components using these tags mixed with your text:
- <component type="destination-grid" data='{"destinations":[{"name":"Paris","country":"France","flag":"🇫🇷","highlight":"City of Light","budget":"$$$$","rating":4.8}]}' /> — when suggesting destinations
- <component type="weather" data='{"city":"Tokyo","forecast":[{"day":"Mon","icon":"☀️","high":22,"low":15}]}' /> — when discussing weather
- <component type="nearby-amenities" data='{"location":"Melbourne","lat":-37.81,"lng":144.96,"radius":1000}' /> — when user asks about nearby places

Rules:
- Always provide valid JSON in the data attribute
- Mix components with regular text naturally
- Keep responses concise and helpful
- If the user asks about a destination, provide practical advice
- If they want an itinerary, ask for destination, duration, and preferences if not provided
- Guide users step by step through trip planning

IMPORTANT: Always guide the user through these steps in order: 1) Ask for destination, 2) Ask for duration, 3) Ask for preferences/interests, 4) Ask for budget, 5) Ask about travel companions, 6) Then say 'Based on your preferences, shall I create your personalized itinerary?' to trigger the generate button.

When discussing food or restaurants, ALWAYS mention halal options if the user has halal in their preferences. For Pakistani cities, recommend well-known restaurants like: Lahore (Cuckoo's Den, Haveli, Butt Karahi, Food Street), Karachi (BBQ Tonight, Kolachi, Okra), Islamabad (Monal, Tuscany Courtyard, Savour Foods).

Never let the conversation get stuck. Always end your response with a question or suggestion for the next step.

USER: ${message}`;
};
