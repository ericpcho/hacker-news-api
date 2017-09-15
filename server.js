'use strict';

require('dotenv').config()

const express = require('express');
const morgan = require('morgan');
const { PORT } = require('./config');
const app = express();
const apiStoriesRouter = require('./apiStoriesRouter')

app.use(morgan(':method :url :res[location] :status'));
app.use('/api/stories', apiStoriesRouter);


let server;
function runServer(){
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    }).on('error', err => {
      reject(err);
    });
  });
}

function closeServer(){
  return new Promise((resolve, reject) => {
    console.log('closing server');
    server.close(err => {
      if (err){
        reject(err);
        return;
      }
      resolve();
    });
  });
}


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

module.exports = { app, runServer, closeServer }; //! export app for testing
