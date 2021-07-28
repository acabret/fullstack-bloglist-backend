const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('express-async-errors');
const loginRouter = require('./controllers/login');
const blogRouter = require('./controllers/blog');
const usersRouter = require('./controllers/users');
const config = require('./utils/config');
const middleware = require('./utils/middleware');

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((res) => console.log('connected to mongodb'))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
// app.use(middleware.tokenExtractor);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

app.use('/api/login', loginRouter);
app.use('/api/blogs', middleware.tokenExtractor, blogRouter);
app.use('/api/users', usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
