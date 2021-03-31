
var db = require('./db.js');
db.init();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./swagger.json');

var userRouter = require('./routes/api/user.js');
var productsRouter = require('./routes/api/products.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// User routes => Signin(/users/login) + Signup(/users/register)
app.use('/users', userRouter);

// Product Routes
app.use('/products', productsRouter);

// Swagger docs 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(function (err, req, res, next) {
	return res.status(400).send({
    status: "fail",
    message: err.message || ""
  });
});

// start server
var server = app.listen(3000, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});