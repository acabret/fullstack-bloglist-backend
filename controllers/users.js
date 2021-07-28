const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    url: 1,
    likes: 1,
  });
  //populate reemplaza la referencia notesId por el
  //objeto note correspondiente a cada id

  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body;

  if (!password || password.length < 3) {
    return response.status(400).send({ error: 'Credenciales inválidas' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({ username, name, passwordHash });

  response.status(201).json(newUser);
});

module.exports = usersRouter;
