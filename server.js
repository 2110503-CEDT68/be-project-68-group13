const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

// Load env
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.set('query parser', 'extended');
app.use(cookieParser());

//////////////////////////////////////////////////
// ✅ ROOT ROUTE (สำคัญมากสำหรับ AWS Health Check)
//////////////////////////////////////////////////
app.get('/', (req, res) => {
  res.status(200).send('Online Job Fair API is running');
});

//////////////////////////////////////////////////
// Routes
//////////////////////////////////////////////////
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/companies', require('./routes/companies'));
app.use('/api/v1/bookings', require('./routes/bookings'));

//////////////////////////////////////////////////
// Server listen (สำคัญบน AWS)
//////////////////////////////////////////////////
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
