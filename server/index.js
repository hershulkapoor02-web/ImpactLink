require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/auth');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const { needRouter, orgRouter, userRouter, notifRouter } = require('./routes/other.routes');

connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests' } });
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/needs', needRouter);
app.use('/api/orgs', orgRouter);
app.use('/api/users', userRouter);
app.use('/api/notifications', notifRouter);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'ImpactLink API running', env: process.env.NODE_ENV }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
