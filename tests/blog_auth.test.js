const { expect, test } = require('@jest/globals');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const testHelper = require('./test_helper');

const blogRoute = '/api/blogs/';
const userRoute = '/api/users/';
const loginRoute = '/api/login/';
const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  await api.post(userRoute).send({ username: 'testy', password: 'testy' });
});

// test('401 when trying to delete a blog and token isnt provided', async () => {
//   const response = api.delete();
// });

test('returns a token', async () => {
  const {
    body: { token },
  } = await api
    .post(loginRoute)
    .send({ username: 'testy', password: 'testy' })
    .expect(200);
});

test('valid token and creates a blog post', async () => {
  const {
    body: { token },
  } = await api
    .post(loginRoute)
    .send({ username: 'testy', password: 'testy' })
    .expect(200);

  await api.post(blogRoute)
    .set({ Authorization: `bearer ${token}` })
    .send({
      title: 'afterblog2',
      url: 'google.com',
      likes: 8,
    })
    .expect(201);
});

test('401 for not having a valid token', async () => {
  await api.post(blogRoute)
    .send({
      title: 'afterblog2',
      url: 'google.com',
      likes: 8,
    })
    .expect(401);
});

afterAll(() => {
  mongoose.connection.close();
});
