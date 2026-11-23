require('dotenv').config();

const dns = require('node:dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const requiredEnvironmentVariables = ['MongoURI', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
  requiredEnvironmentVariables.push(
    'CORS_ORIGINS',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  );
}

const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
  name => !process.env[name]
);
if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`
  );
}

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

if (Boolean(process.env.MAIL_USER) !== Boolean(process.env.MAIL_PASS)) {
  throw new Error('MAIL_USER and MAIL_PASS must both be configured or both omitted.');
}

const dnsServers = process.env.DNS_SERVERS
  ?.split(',')
  .map(server => server.trim())
  .filter(Boolean);
if (dnsServers?.length) {
  dns.setServers(dnsServers);
}

const app = express();
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must contain at least one frontend origin.');
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const customerRouter = require('./routes/user.route');
const apiUserRouter = require('./routes/api.user.route');
const commentRouter = require('./routes/comments.route');

app.use('/user', customerRouter);
app.use('/api/user', apiUserRouter);
app.use('/api/comments', commentRouter);

const port = process.env.PORT || 5001;

async function startServer() {
  await mongoose.connect(process.env.MongoURI);
  console.log('Connected to MongoDB');

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch(error => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
