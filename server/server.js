require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

const CLIENT = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: CLIENT, credentials: true }));

// Rate limiting
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongo connected'))
  .catch((err) => console.error('Mongo error', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5023;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
