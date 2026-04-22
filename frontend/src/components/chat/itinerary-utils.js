/**
 * Pure utility functions for itinerary cost calculation and date management.
 * Extracted from ItineraryCard for testability.
 */

/**
 * Parse a price string into a raw number.
 * Returns null if unparseable.
 * @param {string|number} price
 * @returns {number|null}
 */
export function parsePriceRaw(price) {
    if (typeof price === "number") return price;
    if (typeof price !== "string") return null;
    const cleaned = price.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

/**
 * Recalculate itinerary dates based on a new outbound departure date.
 * Returns a new itinerary object (does not mutate input).
 *
 * @param {Object} itinerary - The full itinerary object
 * @param {string} newDepartureDate - ISO date string of the new departure
 * @returns {Object} Updated itinerary with shifted dates
 */
export function recalculateDates(itinerary, newDepartureDate) {
    const depDate = new Date(newDepartureDate);
    const arrivalDate = new Date(depDate);
    arrivalDate.setDate(arrivalDate.getDate()); // arrival = same day for simplicity

    const totalDays = itinerary.days?.length || 0;
    const newDays = (itinerary.days || []).map((day, index) => {
        const dayDate = new Date(arrivalDate);
        dayDate.setDate(dayDate.getDate() + index);
        return { ...day, date: dayDate.toISOString().split("T")[0] };
    });

    const newEndDate = new Date(arrivalDate);
    newEndDate.setDate(newEndDate.getDate() + totalDays - 1);

    return {
        ...itinerary,
        days: newDays,
        route: {
            ...itinerary.route,
            startDate: depDate.toISOString().split("T")[0],
            endDate: itinerary.returnFlight
                ? itinerary.route?.endDate
                : newEndDate.toISOString().split("T")[0],
        },
    };
}

/**
 * Calculate cost breakdown from itinerary data.
 * Returns an object with individual line items and a total.
 *
 * @param {Object} itinerary
 * @returns {{ outboundFlight: number|null, returnFlight: number|null, hotelTotal: number|null, food: number|null, activities: number|null, total: number }}
 */
export function calculateCosts(itinerary) {
    const outboundFlight = parsePriceRaw(
        itinerary.flight?.priceRaw ?? itinerary.flight?.price
    );
    const returnFlight = parsePriceRaw(
        itinerary.returnFlight?.priceRaw ?? itinerary.returnFlight?.price
    );

    const hotelPricePerNight = parsePriceRaw(
        itinerary.hotel?.priceRaw ??
        itinerary.hotel?.pricePerNight ??
        itinerary.hotel?.price
    );
    const numNights = itinerary.days?.length || 0;
    const hotelTotal =
        hotelPricePerNight != null ? hotelPricePerNight * numNights : null;

    // Estimate food and activities from day activities
    let foodTotal = 0;
    let activitiesTotal = 0;
    (itinerary.days || []).forEach((day) => {
        (day.activities || []).forEach((activity) => {
            const cost = activity.cost?.amount;
            if (cost != null) {
                if (activity.period === "lunch" || activity.period === "dinner") {
                    foodTotal += cost;
                } else {
                    activitiesTotal += cost;
                }
            }
        });
    });

    const items = [
        outboundFlight,
        returnFlight,
        hotelTotal,
        foodTotal || null,
        activitiesTotal || null,
    ];
    const total = items.reduce((sum, val) => sum + (val ?? 0), 0);

    return {
        outboundFlight,
        returnFlight,
        hotelTotal,
        food: foodTotal || null,
        activities: activitiesTotal || null,
        total,
    };
}
