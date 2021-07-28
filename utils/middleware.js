const jwt = require('jsonwebtoken');

const unknownEndpoint = (request, response) => {
  console.log('endpoint desconocido');
  response.status(404).end();
};

const errorHandler = (error, request, response, next) => {
  // console.error(error.message)
  console.log('nombre del error:', error.name);

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired',
    });
  }

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: 'Error de validacion' });
  }

  if (error === 'no se encontro una nota con esa id') {
    return response.status(400).send({ error });
  }

  next(error);
  // console.log("entrando al middleware de errores", error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  // console.log(authorization);
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    // request.token = authorization.substring(7);
    // console.log(authorization.substring(7));
    request.token = authorization.substring(7);
    // console.log(request.token);
  }

  // console.log('se finalizo de extraer el token, buscar en request.token');
  // return;
  next();
};

const isAuth = (request, response, next) => {
  const { token } = request;
  // console.log(token);

  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!token || !decodedToken.id || !decodedToken.username) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  request.user = { username: decodedToken.username, id: decodedToken.id };

  next();
};

// const userExtractor = (request, response, next) => {
//   request.user = { username: request.token.username, id: request.token.id };

//   console.log(request.token);
//   console.log(request.user);

//   next();
// };

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  isAuth,
};
