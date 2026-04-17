import React, { useState, useEffect } from 'react';

import { useSettings } from './useSettings';
import { useWeather } from './useWeather';
import Utils from './utils';

function pad(n) {
    return String(n).padStart(2, '0');
}

function WeatherBlock({ city, weather, error, unit }) {
    const symbol = unit === 'fahrenheit' ? '°F' : '°C';

    // No cached data and error → full error state
    if (!weather && error) return (
        <div className="weather-container" style={{ textAlign: "center" }}>
            Weather unavailable
        </div>
    );

    // No data yet → loading state
    if (!weather) return (
        <div className="weather-container" style={{ textAlign: "center" }}>
            Loading weather...
        </div>
    );

    return (
        <div className="weather-container">
            Today weather in {city} is {weather.description}.<br />
            Temperature is {weather.temperature}{symbol}, min is {weather.min}{symbol}, max is {weather.max}{symbol}.<br />
            It feels like {weather.feelsLike}{symbol}, and humidity is {weather.humidity}%
        </div>
    );
}

export default function App() {
    const settings = useSettings();
    const { weather, error: weatherError } = useWeather({
        enabled: settings.showWeather,
        city: settings.weatherCity,
        unit: settings.temperatureUnit,
    });
    const textColor = settings.theme === 'light' ? '#212121' : '#f8f8f2';
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dd = pad(now.getDate());
    const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const { hour, minute } = Utils.timeToWords(now);

    return (
        <div className="container" style={{ color: textColor }}>
            <div className='date-container'>
                {/* 
                This date container will be a grid of 3x3.
                The result will be something like this:
                
                ┌───────┬───────┬───────┐
                │   M   │   O   │   N   │
                │   -   │   3   │   1   │
                │   S   │   U   │   N   │
                └───────┴───────┴───────┘
                 */}
                <div className='date-cell' style={{ color: settings.accentColor }}>{month[0]}</div>
                <div className='date-cell' style={{ color: textColor }}>{month[1]}</div>
                <div className='date-cell' style={{ color: textColor }}>{month[2]}</div>
                <div className='date-cell' style={{ color: textColor }}>{'-'}</div>
                <div className='date-cell' style={{ color: textColor }}>{dd[0]}</div>
                <div className='date-cell' style={{ color: textColor }}>{dd[1]}</div>
                <div className='date-cell' style={{ color: textColor }}>{day[0]}</div>
                <div className='date-cell' style={{ color: textColor }}>{day[1]}</div>
                <div className='date-cell' style={{ color: textColor }}>{day[2]}</div>
            </div>
            <div className='divider' style={{ backgroundColor: textColor }} />
            <div className='time-container'>
                <span className='time-hour' style={{ color: textColor }}>{hour}</span>
                <span className='time-minute' style={{ color: settings.accentColor }}>{minute}</span>
            </div>
            {settings.showWeather && (
                <div className='weather-block' style={{ color: textColor }}>
                    <WeatherBlock
                        city={settings.weatherCity}
                        weather={weather}
                        error={weatherError}
                        unit={settings.temperatureUnit}
                    />
                </div>
            )}
            <div className='divider' style={{ backgroundColor: textColor }} />
        </div>
    );
}
