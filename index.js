const dotenv = require('dotenv');
const mongoose = require('mongoose');

const createServer = require('./server');
const AppError = require('./utils/appError');

process.on('uncaughtException', (err) => {
    console.log('Unhandled Exception. Shutting Down...');
    console.log(err);

    process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DB_CONNECTION_STRING
  .replace(
    '<PASSWORD>',
    process.env.DB_PASSWORD
  )
  .replace(
      '<DB_NAME>',
      process.env.DB_NAME
  )
  .replace(
      '<DB_USER>',
      process.env.DB_USER
  );

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to the database successfully!'));

const app = createServer();

const port = process.env.PORT || 8000;

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection. Shutting Down...');
    console.log(err);

    server.close(() => {
        process.exit(1);
    });
});

module.exports = server;
