import { updateWeather, error404 } from "./app.js";
const defaultLocation = "#/weather?lat=16.7967129&lon=96.1609916&units=metric" // Yangon

const currentLocation = () => {
    window.navigator.geolocation.getCurrentPosition(res => {
        const { latitude, longitude } = res.coords;
        updateWeather(`Lat=${latitude}`, `lon=${longitude}`);
    }, err => {
        window.location.hash = defaultLocation;
    });
}

const searchedLocation = query => updateWeather(...query.split("&"));

const routes = new Map([
    ["/current-location", currentLocation],
    ["/weather", searchedLocation],
]);

const checkHash = () => {
    const reqURL = window.location.hash.slice(1);
    const [route, query] = reqURL.includes ? reqURL.split("?") : [reqURL];
    routes.get(route) ? routes.get(route)(query) : error404();
}

window.addEventListener("hashchange", checkHash);

window.addEventListener("load", () => {
    if (!window.location.hash) {
        window.location.hash = "#/current-location";
    } else {
        checkHash();
    }
});