const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/LTM-DB');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const journeyRoutes = require("./routes/journeyRoutes");

const app = express();

connectDB();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

  
  
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked: ${origin}`));
        }
      },
      credentials: true,
    })
  );

  // app.use(cors({
  //   origin: "https://ltm-frontend-code.onrender.com",
  //   credentials: true
  // }));
  
  app.use(express.json());
  

app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', memoryRoutes);
app.use("/api/journey", journeyRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Memories Album API Running 🚀' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
