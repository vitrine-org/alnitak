const defaults = {
    theme: 'dark',
    accentColor: '#D50000',
    showWeather: false,
    weatherCity: "",
    temperatureUnit: "celsius"
};

export function useSettings() {
    const loaded = (window.vitrine && window.vitrine.settings) || {};
    return { ...defaults, ...loaded };
}
