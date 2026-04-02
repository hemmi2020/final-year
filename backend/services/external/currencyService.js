const axios = require('axios');

/**
 * Get exchange rate and convert amount
 */
exports.convertCurrency = async (from, to, amount = 1) => {
    try {
        if (!process.env.EXCHANGE_RATE_API_KEY) return null;

        const { data } = await axios.get(
            `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/${from}/${to}/${amount}`
        );

        return {
            from,
            to,
            amount,
            convertedAmount: data.conversion_result,
            rate: data.conversion_rate,
        };
    } catch (error) {
        console.warn('Currency API error:', error.message);
        return null;
    }
};

/**
 * Get exchange rate only
 */
exports.getExchangeRate = async (from, to) => {
    try {
        if (!process.env.EXCHANGE_RATE_API_KEY) return null;

        const { data } = await axios.get(
            `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/${from}/${to}`
        );

        return { from, to, rate: data.conversion_rate };
    } catch (error) {
        console.warn('Exchange rate error:', error.message);
        return null;
    }
};
