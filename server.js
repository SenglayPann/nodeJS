const dotenv = require('dotenv');
const app = require('./app');

process.on('uncaughtException', err => {
  console.log("UNCAUGHT EXCEPTION! SHUTTINGDOWN...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

console.log('MODE: ', process.env.NODE_ENV);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});