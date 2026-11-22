const externalApiService = require('../services/externalApiService');

async function getWeather(req, res, next) {
  try {
    const data = await externalApiService.getWeather();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function getQuote(req, res, next) {
  try {
    const data = await externalApiService.getDailyQuote();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

function getHolidays(req, res, next) {
  try {
    const data = externalApiService.getHolidays();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function getFeed(req, res, next) {
  try {
    const [weather, quote, holidays] = await Promise.all([
      externalApiService.getWeather(),
      externalApiService.getDailyQuote(),
      externalApiService.getHolidays()
    ]);

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      weather,
      quote,
      holidays: holidays.holidays
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWeather,
  getQuote,
  getHolidays,
  getFeed
};
