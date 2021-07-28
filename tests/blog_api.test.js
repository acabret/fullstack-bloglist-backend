const { expect, test } = require('@jest/globals');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const testHelper = require('./test_helper');

const baseRoute = '/api/blogs/';

beforeEach(async () => {
  await Blog.deleteMany({});

  await Blog.create(testHelper.initialBlogPosts);
});

const api = supertest(app);

test('blogs returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('amount of blogs in db same as the initials', async () => {
  const response = await api.get('/api/blogs');
  const expected = testHelper.initialBlogPosts.length;

  expect(response.body).toHaveLength(expected);
});

test('the returned object contains the data sent', async () => {
  const newBlog = {
    title: 'Lamps are the new hot deal',
    author: 'Lamp5',
    url: 'http://coolbloog.tk',
    likes: 7,
  };

  const response = await api.post('/api/blogs').send(newBlog);

  expect(response.body).toMatchObject(newBlog);
});

test('http 400 if title and author are missing', async () => {
  const newBlog = {
    url: 'http://coolbloog.tk',
    likes: 7,
  };

  await api.post('/api/blogs').send(newBlog).expect(400);
});

test('likes property defaults to 0 if missing', async () => {
  const newBlog = {
    title: 'Lamps are the new hot deal',
    author: 'Lamp5',
    url: 'http://coolbloog.tk',
  };

  const response = await api.post('/api/blogs').send(newBlog);

  expect(response.body.likes).toBe(0);
});

test('the _id mongoose default property is renamed to id', async () => {
  const response = await api.get('/api/blogs');
  const sampleObject = response.body[0];

  expect(sampleObject).not.toHaveProperty('_id');
  expect(sampleObject).toHaveProperty('id');
  expect(sampleObject.id).toBeDefined();
});

test('can modify a blogpost', async () => {
  const blogs = await api.get('/api/blogs/');
  const firstBlog = blogs.body[0];

  console.log(firstBlog);

  const modifiedBlog = { ...firstBlog };
  modifiedBlog.title = 'some new title';

  console.log(modifiedBlog);

  const response = await api
    .put(`/api/blogs/${modifiedBlog.id}`)
    .send(modifiedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  //   console.log(response.body);

  expect(response.body).not.toEqual(firstBlog);
  expect(response.body).not.toMatchObject(firstBlog);
  expect(response.body.title).not.toMatch(firstBlog.title);
  expect(Object.keys(response.body)).toMatchObject(Object.keys(modifiedBlog));
});

test('matchers', () => {
  const response = { name: 'johnny', age: 18 };
  const compare = { name: 'johnny', age: 18 };

  expect(response).toMatchObject(compare);
});

test('can delete a blog post', async () => {
  const blogBeforeDeletion = testHelper.initialBlogPosts;
  const firstBlog = testHelper.initialBlogPosts[0];

  await api.delete(`/api/blogs/${firstBlog._id}`).expect(204);

  const blogAmountInDb = await api.get(baseRoute);

  expect(blogAmountInDb.body.length).toEqual(blogBeforeDeletion.length - 1);
});

afterAll(() => {
  mongoose.connection.close();
});
