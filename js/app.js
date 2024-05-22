import { apidata, url } from "./api.js";
import * as module from "./module.js";

const addEventonElements = (elements, eventType, callback) => {
    for ( const element of elements ) element.addEventListener(eventType, callback);
}

// Toogle search in mobile devices
const searchView = document.querySelector("#search-view");
const searchBtn = document.querySelectorAll("#data-search-toggle");
const searchToggle = () => searchView.classList.toggle("active");
addEventonElements(searchBtn, "click", searchToggle);

const searchField = document.querySelector("#search-field");
const searchResult = document.querySelector("#search-result");

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", () => {
    searchTimeout ?? clearTimeout(searchTimeout);

    if (!searchField.value) {
        searchResult.classList.remove("active");
        searchResult.innerHTML = "";
        searchField.classList.remove("searching");
    } else {
        searchField.classList.add("searching")
    }

    if (searchField.value) {
        searchTimeout = setTimeout(() => {
            apidata(url.geocoding_api(searchField.value), (locations) => {
                searchField.classList.remove("searching");
                searchResult.classList.add("active");
                searchResult.innerHTML = `
                    <ul class="view-list" id="data-view-list"></ul>
                `;
                const items = [];
                for ( const { name, lat, lon, country, state } of locations ) {
                    const searchItem = document.createElement("li");
                    searchItem.classList.add("view-item");
                    searchItem.innerHTML = `
                        <span class="icon"><i class="fa-solid fa-location-dot"></i></span>
                        <div class="">
                            <p class="item-title">${name}</p>
                            <p class="item-subtitle">${state || ""} ${country}</p>
                        </div>
                        <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" id="data-item-link" aria-label="${name} weather"></a>
                    `;

                searchResult.querySelector("#data-view-list").appendChild(searchItem);
                items.push(searchItem.querySelector("#data-item-link"))
                }

                addEventonElements(items, "click", () => {
                    searchToggle();
                    searchResult.classList.remove("active");
                });
            });
        }, searchTimeoutDuration)
    }
});

const container = document.querySelector("#container");
const loading = document.querySelector("#data-loading");
const currentLocationBtn = document.querySelector("#current-location-btn");
const errorContent = document.querySelector("#error-content");

export const updateWeather = (lat, lon) => {
    errorContent.style.display = "none";

    const currentWeatherSection = document.querySelector("#current-weather-section");
    const forecastWeatherSection = document.querySelector("#forecast-weather-section");
    const highlightsWeatherSection = document.querySelector("#highlights-weather-section");
    const hourlyWeatherSection = document.querySelector("#hourly-forecast-weather-section");

    currentWeatherSection.innerHTML = "";
    forecastWeatherSection.innerHTML = "";
    highlightsWeatherSection.innerHTML = "";
    hourlyWeatherSection.innerHTML = "";

    if( window.location.hash === "#/current-location" ) {
        currentLocationBtn.setAttribute("disabled", "");
    } else {
        currentLocationBtn.removeAttribute("disabled");
    }

    // current weather
    apidata(url.currentWeather(lat, lon), (currentWeather) => {
        //  ES6 destructuring assignment
        const {
            weather,
            dt: dateUnix,
            sys: { sunrise: sunriseUnixUTC, simset: sumsetUnixUTC },
            main: {temp, feels_like, pressure, humidity},
            visibility,
            timezone
        } = currentWeather
        const [{ description, icon  }] = weather;

        const card = document.createElement("div");
        card.classList.add("card", "card-lg", "current-weather-card");
        card.innerHTML = `
            <h2 class="title-2 card-title">Now</h2>
            <div class="card-body">
                <p class="heading">${parseInt(temp)}&deg;<sup>c</sup></p>
                <img src="./assets/images/weather_icons/${icon}.png" width="64" height="64" alt="${description}" class="weather-icon">
            </div>
            <p class="body-3">${description}</p>
            <ul class="meta-list">
                <li class="meta-item">
                    <span class="icon"><i class="fa-regular fa-calendar"></i></span>
                    <p class="title-3 meta-text">${module.getDate(dateUnix, timezone)}</p>
                </li>
                <li class="meta-item">
                    <span class="icon"><i class="fa-solid fa-location-dot"></i></span>
                    <p class="title-3 meta-text" id="data-location"></p>
                </li>
            </ul>
        `;
        apidata(url.reverseGeocoding(lat, lon), ([{name, country}]) => {
            card.querySelector("#data-location").innerHTML = `${name}, ${country}`;
        });

        currentWeatherSection.appendChild(card);

        // today's highlights
        apidata(url.airPollution(lat, lon), (airPollution) => {
            const [{
                main: { aqi },
                components: { no2, o3, so2, pm2_5 }
            }] = airPollution.list;
            const card = document.createElement("div");
            card.classList.add("card", "card-lg");
            card.innerHTML = `
                <h2 class="title-2" id="highlights-label">Today Highlights</h2>
                    <div class="highlight-list">
                        <div class="card card-sm highlight-card one">
                            <h3 class="title-3">Air Quality Index</h3>
                            <div class="highlight-card-body">
                                <span class="icon"><i class="fa-solid fa-wind"></i></span>
                                <ul class="card-list">
                                    <li class="card-item">
                                        <p class="title-1">${pm2_5.toPrecision(3)}</p>
                                        <p class="label-1">PM<sub>2.5</sub></p>
                                    </li>

                                    <li class="card-item">
                                        <p class="title-1">${so2.toPrecision(3)}</p>
                                        <p class="label-1">SO<sub>2</sub></p>
                                    </li>

                                    <li class="card-item">
                                        <p class="title-1">${no2.toPrecision(3)}</p>
                                        <p class="label-1">NO<sub>2</sub></p>
                                    </li>

                                    <li class="card-item">
                                        <p class="title-1">${o3.toPrecision(3)}</p>
                                        <p class="label-1">O<sub>3</sub></p>
                                    </li>
                                </ul>
                            </div>
                            <span class="badge aqi-${aqi} label-${aqi}" title="${module.aqiText[aqi].message}">${module.aqiText[aqi].level}</span>
                        </div>

                        <div class="card card-sm highlight-card two">
                            <h3 class="title-3">Sunrise & Sunset</h3>
                            <div class="card-list">
                                <div class="card-item">
                                    <span class="icon"><i class="fa-regular fa-sun"></i></span>
                                    <div>
                                        <p class="label-1">Sunrise</p>
                                        <p class="title-1">${module.getTime(sunriseUnixUTC, timezone)}</p>
                                    </div>
                                </div>

                                <div class="card-item">
                                    <span class="icon"><i class="fa-solid fa-moon"></i></span>
                                    <div>
                                        <p class="label-1">Sunset</p>
                                        <p class="title-1">${module.getTime(sumsetUnixUTC, timezone)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card card-sm highlight-card">
                            <h3 class="title-3">Humidity</h3>
                            <div class="highlight-card-body">
                                <span class="icon"><i class="fa-solid fa-droplet"></i></span>
                                <p class="title-1">${humidity}<sub>%</sub></p>
                            </div>
                        </div>

                        <div class="card card-sm highlight-card">
                            <h3 class="title-3">Pressure</h3>
                            <div class="highlight-card-body">
                                <span class="icon"><i class="fa-solid fa-water"></i></span>
                                <p class="title-1">${pressure}<sub>hPa</sub></p>
                            </div>
                        </div>

                        <div class="card card-sm highlight-card">
                            <h3 class="title-3">Visibility</h3>
                            <div class="highlight-card-body">
                                <span class="icon"><i class="fa-solid fa-eye"></i></span>
                                <p class="title-1">${visibility / 1000}<sub>km</sub></p>
                            </div>
                        </div>

                        <div class="card card-sm highlight-card">
                            <h3 class="title-3">Feels Like</h3>
                            <div class="highlight-card-body">
                                <span class="icon"><i class="fa-solid fa-temperature-half"></i></span>
                                <p class="title-1">${parseInt(feels_like)}&deg;<sup>c</sup></p>
                            </div>
                        </div>
                    </div>
            `;

        highlightsWeatherSection.appendChild(card);
        });

        // hourly forecast
        apidata(url.forecast(lat, lon), (forecast) => {
            const {
                list: forecastList,
                city: { timezone }
            } = forecast;
            hourlyWeatherSection.innerHTML = `
                <h2 class="title-2">Today at</h2>
                <div class="slider-container">
                    <!-- temp -->
                    <ul class="slider-list" id="temp-data"></ul>

                    <!-- wind -->
                    <ul class="slider-list" id="wind-data"></ul>
                </div>
            `;

            for ( const [index, data] of forecastList.entries() ) {
                if ( index > 7 ) break;

                const {
                    dt: dataTimeUnix,
                    main: { temp },
                    weather,
                    wind: { deg: windDirection, speed: windSpeed }
                } = data
                const [{ icon, description }] = weather

                // temp
                const tempLi = document.createElement("li");
                tempLi.classList.add("slider-item");
                tempLi.innerHTML = `
                    <div class="card card-sm slider-card">
                        <p class="body-3">${module.getHours(dataTimeUnix, timezone)}</p>
                        <img src="./assets/images/weather_icons/${icon}.png" width="48px" height="48px" class="weather-icon" title="${description}" alt="${description}">
                        <p class="body-3">${parseInt(temp)}&deg;</p>
                    </div>
                `;
                hourlyWeatherSection.querySelector("#temp-data").appendChild(tempLi);

                // wind
                const windLi = document.createElement("li");
                windLi.classList.add("slider-item");
                windLi.innerHTML = `
                    <div class="card card-sm slider-card">
                        <p class="body-3">${module.getHours(dataTimeUnix, timezone)}</p>
                        <img src="./assets/images/weather_icons/direction.png" width="48px" height="48px" class="weather-icon" alt="direction" style="transform: rotate(${windDirection - 180}deg)">
                        <p class="body-3">${parseInt(module.mps_to_kmh(windSpeed))} km/h</p>
                    </div>
                `;
                hourlyWeatherSection.querySelector("#wind-data").appendChild(windLi);
            }

            // 5 days forecast
            forecastWeatherSection.innerHTML = `
                <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>
                    <div class="card card-lg forecast-card">
                        <ul id="data-forecast-card"></ul>
                    </div>
            `;
            for ( let i = 7, len = forecastList.length; i < len; i += 8 ) {
                const {
                    main: { temp_max },
                    weather,
                    dt_txt
                } = forecastList[i];
                const [{ icon, description }] = weather
                const date = new Date(dt_txt);
                const li = document.createElement("li");
                li.classList.add("card-item");
                li.innerHTML = `
                <div class="card-icon">
                    <img src="./assets/images/weather_icons/${icon}.png" width="36" height="36" class="weather-icon" title="${description}" alt="${description}">
                    <span>
                        <p class="title-2">${parseInt(temp_max)}&deg;<sup>C</sup></p>
                    </span>
                </div>
                <p class="label-1">${date.getDate()} ${module.monthNames[date.getUTCMonth()]}</p>
                <p class="label-1">${module.weekDayNames[date.getUTCDay()]}</p>
                `;
                forecastWeatherSection.querySelector("#data-forecast-card").appendChild(li);
            }
            loading.style.display ="none";
            container.style.overflow = "overlay";
            container.classList.add("fade-in");
        })
    });
};

export const error404 = () => errorContent.style.display = "flex";