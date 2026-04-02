const axios = require('axios');

const WEATHER_API = 'https://api.openweathermap.org/data/2.5';

/**
 * Get current weather (preference-aware: temp unit)
 */
exports.getCurrentWeather = async (lat, lng, units = 'metric') => {
    try {
        if (!process.env.OPENWEATHER_API_KEY) return null;

        const { data } = await axios.get(`${WEATHER_API}/weather`, {
            params: {
                lat, lon: lng,
                appid: process.env.OPENWEATHER_API_KEY,
                units,
            },
        });

        return {
            temp: data.main.temp,
            feelsLike: data.main.feels_like,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            units,
        };
    } catch (error) {
        console.warn('Weather API error:', error.message);
        return null;
    }
};

/**
 * Get multi-day forecast
 */
exports.getForecast = async (lat, lng, days = 7, units = 'metric') => {
    try {
        if (!process.env.OPENWEATHER_API_KEY) return null;

        const { data } = await axios.get(`${WEATHER_API}/forecast`, {
            params: {
                lat, lon: lng,
                appid: process.env.OPENWEATHER_API_KEY,
                units,
                cnt: days * 8,
            },
        });

        return data.list.map(item => ({
            dt: item.dt_txt,
            temp: item.main.temp,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
        }));
    } catch (error) {
        console.warn('Weather forecast error:', error.message);
        return null;
    }
};
