const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const app = express();


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

// Routes
const usersRouter = require('./routes/users');
const savingsRouter = require('./routes/savings');
const contributionsRouter = require('./routes/contributions');
const expensesRouter = require('./routes/expenses');

app.use('/users', usersRouter);
app.use('/savings', savingsRouter);
app.use('/contributions', contributionsRouter);
app.use('/expenses', expensesRouter);
app.use('/', (req, res) => {
  res.json({ message: 'Welcome to the Save Up API!' });
});

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
