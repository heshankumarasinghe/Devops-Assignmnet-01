const path = require('path');

const dotenv = require('dotenv');
const mongoose = require("mongoose")
const supertest = require('supertest');

const createServer = require("../server")

beforeAll((done) => {
  done();
});

beforeEach((done) => {
    dotenv.config({path: path.join(__dirname, 'config.env')});

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
      .then(() => { 
        console.log('Connected to the database successfully!'); 
      });

  done();
})

const app = createServer();

afterEach((done) => {
	mongoose.connection.db.dropDatabase(() => mongoose.connection.close());
  done();
})

test('POST /api/v1/auth/signup', async () => {
  const data = {
      name: 'Test User 1',
      email: 'test1@gmail.com',
      password: 'passs@1234!',
      passwordConfirm: 'passs@1234!'
  };

  const response = await supertest(app)
      .post('/api/v1/auth/signup')
      .send(data)
      .expect(201);

  expect(response.body.status).toBe('success');
}, 180000);
