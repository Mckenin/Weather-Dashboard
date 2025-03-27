import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();
// Define a City class with name and id properties
class City {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
// Define a class for the Weather object
class Weather {
    constructor(temperature, description, city) {
        this.temperature = temperature;
        this.description = description;
        this.city = city;
    }
}
class WeatherService {
    constructor() {
        this.baseURL = 'https://api.openweathermap.org/data/2.5';
        this.apiKey = process.env.API_KEY;
    }
    // Fetch location data
    async fetchLocationData(query) {
        const url = `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
        const response = await fetch(url);
        return response.json();
    }
    // Extract coordinates from location data
    destructureLocationData(locationData) {
        return {
            latitude: locationData[0]?.lat,
            longitude: locationData[0]?.lon,
        };
    }
    // Build weather query URL
    buildWeatherQuery(coordinates) {
        return `${this.baseURL}/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${this.apiKey}&units=metric`;
    }
    // Fetch and parse weather data
    async fetchWeatherData(coordinates) {
        const url = this.buildWeatherQuery(coordinates);
        const response = await fetch(url);
        return response.json();
    }
    // Parse weather response
    parseCurrentWeather(response) {
        return new Weather(response.main.temp, response.weather[0].description, response.name);
    }
    // Get weather for a city
    async getWeatherForCity(city) {
        const locationData = await this.fetchLocationData(city);
        const coordinates = this.destructureLocationData(locationData);
        const weatherData = await this.fetchWeatherData(coordinates);
        return this.parseCurrentWeather(weatherData);
    }
}
class HistoryService {
    constructor() {
        this.filePath = path.join(__dirname, 'searchHistory.json');
    }
    // Define a read method that reads from the searchHistory.json file
    async read() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            return [];
        }
    }
    // Define a write method that writes the updated cities array to the searchHistory.json file
    async write(cities) {
        await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), 'utf-8');
    }
    // Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
    async getCities() {
        return await this.read();
    }
    // Define an addCity method that adds a city to the searchHistory.json file
    async addCity(cityName) {
        const cities = await this.read();
        const newCity = new City(Date.now().toString(), cityName);
        cities.push(newCity);
        await this.write(cities);
    }
    // BONUS: Define a removeCity method that removes a city from the searchHistory.json file
    async removeCity(id) {
        let cities = await this.read();
        cities = cities.filter(city => city.id !== id);
        await this.write(cities);
    }
}
export const weatherService = new WeatherService();
export default new HistoryService();
