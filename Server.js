const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/LTM-DB');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const memoryRoutes = require('./routes/memoryRoutes');

const app = express();

// Middleware
// app.use(cors());
app.use(
  cors({
    origin: "*",
    credentials: true
  })
);
app.use(express.json());


// DB connect
connectDB();

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use("/uploads", express.static("uploads"));
app.use('/api', memoryRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API Running 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));