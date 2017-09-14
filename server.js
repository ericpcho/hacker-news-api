'use strict';

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { DATABASE, PORT } = require('./config');
const knex = require('knex')(DATABASE);

const app = express();

app.use(morgan(':method :url :res[location] :status'));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('hello world');
});

// ADD YOUR ENDPOINTS HERE
app.post('/api/stories', (req, res) => {
  console.log('running post');
  knex
    .insert({
      title: req.body.title,
      url: req.body.url,
      //votes: 0
    })
    .into('news')
    .returning('title')
    .then(function(storyTitle) {
      console.log('ready to return');
      res.status(201).send(storyTitle);
    });
});

app.get('/api/stories', (req, res) => {
  console.log('running get');
  knex.select()
    .from('news')
    .orderBy('title')
    .then(results => res.json(results));
});


/** if (require.main === module) ...
 * Only run this block if file is run using `npm start` or `node server.js`
 * Fixes error: "Trying to open unclosed connection." when running mocha tests
 */


if (require.main === module) {
  const server = app
    .listen(PORT, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error(err);
    });
}

module.exports = { app }; //! export app for testing