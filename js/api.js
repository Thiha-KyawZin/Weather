const apikey = "3f67d8321e1724796c1eafc739a685e8";

export const apidata = (URL, callback) => {
    fetch(`${URL}&appid=${apikey}`)
    .then(res => res.json())
    .then(jsonData => callback(jsonData));
}

export const url = {
    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`
    },

    forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`
    },

    airPollution(lat, lon) {
        return `http://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}`
    },

    geocoding_api(query) {
        return `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`
    },

    reverseGeocoding(lat, lon) {
        return `http://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}`
    },
}

// const a = (num, fun) => {
//     let jsonD = fun(num);
//     console.log(jsonD);
// }

// a(5, (x) => {
//     return x + 5;
// });
