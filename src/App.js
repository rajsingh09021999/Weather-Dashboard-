import React, { useState } from 'react';
import './App.css'; // Use external CSS for styling

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = 'd9c15b9e7acd7b358f08a00791c54247';

  const popularCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

  const handleSearch = async (cityName) => {
    setLoading(true);
    setError('');

    try {
      // Fetch current weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`
      );
      const weather = await weatherResponse.json();

      if (weather.cod !== 200) {
        setError('City not found. Please try another.');
        setLoading(false);
        return;
      }

      // Fetch 5-day forecast data
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`
      );
      const forecast = await forecastResponse.json();

      if (forecast.cod !== '200') {
        setError('Error fetching forecast data. Please try again.');
        setLoading(false);
        return;
      }

      setWeatherData(weather);
      setForecastData(forecast);
      setCity(cityName); // Update the city input to reflect the clicked city
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Error fetching weather data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatForecast = () => {
    if (!forecastData) return [];

    // Group data by date
    const groupedData = forecastData.list.reduce((acc, reading) => {
      const date = reading.dt_txt.split(' ')[0]; // Extract the date (YYYY-MM-DD)
      if (!acc[date]) acc[date] = [];
      acc[date].push(reading);
      return acc;
    }, {});

    // Calculate daily high and low temperatures
    const dailyData = Object.entries(groupedData).map(([date, readings]) => {
      const temps = readings.map((r) => r.main.temp);

      const high = Math.max(...temps).toFixed(1);
      const low = Math.min(...temps).toFixed(1);

      // Determine the most frequent weather description for the day
      const weatherDescriptions = readings.map((r) => r.weather[0].description);
      const mostFrequentDescription = weatherDescriptions.sort(
        (a, b) =>
          weatherDescriptions.filter((v) => v === a).length -
          weatherDescriptions.filter((v) => v === b).length
      ).pop();

      return {
        date,
        high,
        low,
        description: mostFrequentDescription,
        icon: readings[0].weather[0].icon, // Use the icon from the first reading
      };
    });

    return dailyData;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather Dashboard</h1>

        {/* Search Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(city);
          }}
          className="search-form"
        >
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {/* Popular Cities */}
        <div className="popular-cities">
          <p>Try these cities:</p>
          {popularCities.map((cityName, index) => (
            <button
              key={index}
              onClick={() => handleSearch(cityName)}
              className="popular-city-button"
            >
              {cityName}
            </button>
          ))}
        </div>
      </header>

      {/* Loading Message */}
      {loading && <p className="loading-message">Loading data, please wait...</p>}

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Display Current Weather Data */}
      {weatherData && !loading && (
        <div className="weather-card">
          <h2>
            {weatherData.name}, {weatherData.sys.country}
          </h2>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt="weather-icon"
            className="weather-icon"
          />
          <div className="temperature-info">
            <p><strong>Temperature:</strong> {weatherData.main.temp.toFixed(1)}°F</p>
            <p><strong>Feels Like:</strong> {weatherData.main.feels_like.toFixed(1)}°F</p>
            <p><strong>Low:</strong> {weatherData.main.temp_min.toFixed(1)}°F</p>
            <p><strong>High:</strong> {weatherData.main.temp_max.toFixed(1)}°F</p>
          </div>
          <p><strong>Weather:</strong> {weatherData.weather[0].description}</p>
          <p><strong>Humidity:</strong> {weatherData.main.humidity}%</p>
          <p><strong>Wind Speed:</strong> {weatherData.wind.speed} mph</p>
        </div>
      )}

      {/* Display Five-Day Forecast */}
      {forecastData && !loading && (
        <div className="forecast-container">
          <h2>5-Day Forecast</h2>
          <div className="forecast-grid">
            {formatForecast().map((day, index) => (
              <div key={index} className="forecast-card">
                <p>
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                  })}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                  alt="forecast-icon"
                  className="forecast-icon"
                />
                <p><strong>{day.description}</strong></p>
                <p><strong>High:</strong> {day.high}°F</p>
                <p><strong>Low:</strong> {day.low}°F</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
