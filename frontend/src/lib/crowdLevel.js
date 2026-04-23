/**
 * Returns crowd level and best time info based on place type and current time.
 * Pure heuristic function — no API calls needed.
 *
 * @param {string} placeType - 'mosque', 'museum', 'restaurant', 'market', 'beach', 'attraction', etc.
 * @param {number} hour - Current hour (0-23)
 * @param {number} dayOfWeek - 0=Sunday, 6=Saturday
 * @returns {{ level: string, emoji: string, bestTime: string, bestDays: string, peakHours: string }}
 */
export function getCrowdInfo(
    placeType,
    hour = new Date().getHours(),
    dayOfWeek = new Date().getDay()
) {
    const type = (placeType || "").toLowerCase();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFriday = dayOfWeek === 5;

    let level = "Low";
    let bestTime = "";
    let bestDays = "";
    let peakHours = "";

    switch (type) {
        case "mosque": {
            // Jummah prayer: Friday 12-2pm is peak
            // Regular prayer times: ~5am (Fajr), ~1pm (Dhuhr), ~4pm (Asr), ~7pm (Maghrib), ~8pm (Isha)
            peakHours = "Fri 12–2 PM (Jummah)";
            bestTime = "Mid-morning (9–11 AM)";
            bestDays = "Mon–Thu";

            if (isFriday && hour >= 12 && hour < 14) {
                level = "Very Busy";
            } else if (
                hour === 5 ||
                hour === 13 ||
                hour === 16 ||
                hour === 19 ||
                hour === 20
            ) {
                level = "Moderate";
            } else if (isFriday) {
                level = "Moderate";
            } else {
                level = "Low";
            }
            break;
        }

        case "museum": {
            peakHours = "Sat–Sun 11 AM – 3 PM";
            bestTime = "Weekday mornings (9–11 AM)";
            bestDays = "Tue–Thu";

            if (isWeekend && hour >= 11 && hour < 15) {
                level = "Very Busy";
            } else if (isWeekend && hour >= 9 && hour < 17) {
                level = "Busy";
            } else if (!isWeekend && hour >= 11 && hour < 15) {
                level = "Moderate";
            } else {
                level = "Low";
            }
            break;
        }

        case "restaurant": {
            peakHours = "1–2 PM (lunch), 7–9 PM (dinner)";
            bestTime = "11 AM or 3–5 PM";
            bestDays = "Mon–Wed";

            const isLunchPeak = hour >= 13 && hour < 14;
            const isDinnerPeak = hour >= 19 && hour < 21;
            const isLunchRush = hour >= 12 && hour < 15;
            const isDinnerRush = hour >= 18 && hour < 22;

            if ((isLunchPeak || isDinnerPeak) && isWeekend) {
                level = "Very Busy";
            } else if (isLunchPeak || isDinnerPeak) {
                level = "Busy";
            } else if (isLunchRush || isDinnerRush) {
                level = "Moderate";
            } else {
                level = "Low";
            }
            break;
        }

        case "market":
        case "shopping": {
            peakHours = "5–9 PM, weekends";
            bestTime = "Weekday mornings (9–11 AM)";
            bestDays = "Mon–Wed";

            const isEveningPeak = hour >= 17 && hour < 21;

            if (isEveningPeak && isWeekend) {
                level = "Very Busy";
            } else if (isEveningPeak || (isWeekend && hour >= 10 && hour < 21)) {
                level = "Busy";
            } else if (hour >= 10 && hour < 17) {
                level = "Moderate";
            } else {
                level = "Low";
            }
            break;
        }

        case "beach": {
            peakHours = "Sat–Sun 9 AM – 12 PM";
            bestTime = "Early morning (6–8 AM) or late afternoon (4–6 PM)";
            bestDays = "Mon–Thu";

            if (isWeekend && hour >= 9 && hour < 12) {
                level = "Very Busy";
            } else if (isWeekend && hour >= 8 && hour < 16) {
                level = "Busy";
            } else if (!isWeekend && hour >= 9 && hour < 16) {
                level = "Moderate";
            } else {
                level = "Low";
            }
            break;
        }

        case "attraction":
        default: {
            peakHours = "Sat–Sun 10 AM – 4 PM";
            bestTime = "Weekday mornings (9–10 AM)";
            bestDays = "Tue–Thu";

            if (isWeekend && hour >= 10 && hour < 16) {
                level = "Very Busy";
            } else if (isWeekend && hour >= 9 && hour < 18) {
                level = "Busy";
            } else if (!isWeekend && hour >= 10 && hour < 16) {
                level = "Moderate";
            } else {
                level = "Low";
            }
            break;
        }
    }

    const emojiMap = {
        Low: "🟢",
        Moderate: "🟡",
        Busy: "🔴",
        "Very Busy": "🚨",
    };

    return {
        level,
        emoji: emojiMap[level] || "🟢",
        bestTime,
        bestDays,
        peakHours,
    };
}
