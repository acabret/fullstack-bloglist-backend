const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const middleware = require('../utils/middleware');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('author', {
    username: 1,
    name: 1,
  });

  response.json(blogs);
});

blogRouter.post('/', middleware.isAuth, async (request, response) => {
  const { title, url, likes } = request.body;
  const author = await User.findById(request.user.id);

  if (!author) return response.status(400).send({ error: 'no hay nadie' });

  const newBlog = await Blog.create({
    title,
    author: author._id,
    url,
    likes,
  });

  author.blogs = author.blogs.concat(author._id);
  author.save();

  await newBlog.execPopulate('author', {
    username: 1,
    name: 1,
  });
  console.log(newBlog);

  return response.status(201).json(newBlog);
});

blogRouter.put('/:id', middleware.isAuth, async (request, response) => {
  const blogId = request.params.id;
  const { body } = request;

  console.log(body);

  body.author = body.author.id;
  // console.log(body);

  const updatedBlog = await Blog.findByIdAndUpdate(blogId, body, { new: true });

  await updatedBlog.execPopulate('author', {
    username: 1,
    name: 1,
  });

  response.json(updatedBlog);
});

blogRouter.delete('/:id', middleware.isAuth, async (request, response) => {
  console.log('tratando de borrar un blog');

  const blogForDeletion = await Blog.findById(request.params.id);

  console.log(blogForDeletion);
  if (!blogForDeletion) {
    return response.status(404).send({ error: 'no existe el recurso' });
  }

  if (request.user.id.toString() !== blogForDeletion.author.toString()) {
    return response.status(401).send({ error: 'not authorized for deletion' });
  }

  await blogForDeletion.remove();
  console.log('se borro?', blogForDeletion);
  return response.status(204).send();
});

module.exports = blogRouter;
