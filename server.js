const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
    console.log('Unhandled Exception. Shutting Down...');
    console.log(err.name, err.message);

    process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );
  
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to the database successfully!'));

const app = require('./app');

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
