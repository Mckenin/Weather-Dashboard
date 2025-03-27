import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { Router, type Request, type Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService';

dotenv.config();

const app = express();
const router = Router();
const PORT = process.env.PORT || 3001;

// Serve static files of entire client dist folder
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Implement middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Implement middleware to connect the routes
app.use('/api', router);

// POST Request with city name to retrieve weather data
router.post('/weather', async (req: Request, res: Response) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

    // GET weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(city);
    
    // Save city to search history
    await HistoryService.addCity(city);

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});

// GET search history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    res.json({ message: 'City removed from search history' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete city from history' });
  }
});

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));

export default router;
