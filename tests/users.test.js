const { expect, test } = require('@jest/globals');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const testHelper = require('./test_helper');

beforeEach(async () => {
  await User.deleteMany({});

  // await User.create(testHelper.initialUsers);
});

const api = supertest(app);

test('a user is succesfully created', async () => {
  const firstUser = testHelper.initialUsers[0];

  const createdUser = (
    await api
      .post('/api/users/')
      .send(firstUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  ).body;

  expect(createdUser).toHaveProperty('id');
  expect(createdUser).toHaveProperty('username', firstUser.username);
  expect(createdUser).toHaveProperty('name', firstUser.name);
});

test('a user without name property is created', async () => {
  const someUser = { username: 'someuser', password: '123456' };

  const createdUser = (
    await api
      .post('/api/users/')
      .send(someUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  ).body;

  expect(createdUser).toHaveProperty('id');
  expect(createdUser).toHaveProperty('username', someUser.username);
  expect(createdUser).not.toHaveProperty('name');
});

test('invalid username is rejected with error message and 400', async () => {
  const invalidUser = { username: 'as', password: '123456' };

  const response = (
    await api
      .post('/api/users/')
      .send(invalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  ).body;

  expect(response).toEqual({ error: 'Error de validacion' });
});

test('invalid password is rejected with error message and 400', async () => {
  const invalidUser = { username: 'asdman', password: '12' };

  const response = (
    await api
      .post('/api/users/')
      .send(invalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  ).body;

  expect(response).toEqual({ error: 'Credenciales inválidas' });
});

afterAll(() => {
  mongoose.connection.close();
});
