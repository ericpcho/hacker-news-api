'use strict';

require('dotenv').config()

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
let newId;
app.post('/api/stories', (req, res) => {
  console.log('running post');
  knex
    .insert({
      title: req.body.title,
      url: req.body.url,
      //votes: 0
    })
    .into('news')
    .returning('id')
    .then(([id]) => {
      newId = id;
      let promises = [];
  
      req.body.tags.forEach(tag => {
        const promise = knex('news_tags')
          .insert({
            news_id: newId,
            tags_id: tag
          })
          promises.push(promise);
      });
      return Promise.all(promises);
    })
    .then(() => {
      res.location(`/api/stories/${newId}`).sendStatus(201);
    })
    
});

// app.get('/api/stories', (req, res) => {
//   console.log('running get');
//   knex.select()
//     .from('news')
//     .orderBy('title')
//     .then(results => res.json(results));
// });

app.get('/api/stories', (req, res) => {
  console.log('running get');
  knex.select('news.id', 'title', 'url', 'votes', 'tags.id', 'tag', 'tags_id', 'news_id')
    .from('news')
    .join('news_tags', 'news.id', 'news_tags.news_id')
    .join('tags', 'news_tags.tags_id', 'tags.id')
    .orderBy('news_id')
    .then(results => {
      const hydRes = [], lookup = {};
      for (let story of results) {
        if (!lookup[story.news_id]) {
          lookup[story.news_id] = {
            news_id: story.news_id,
            title: story.title,
            url: story.url,
            votes: story.votes,
            tags: []
          };
          hydRes.push(lookup[story.id]);
        }
        lookup[story.news_id].tags.push({
          id: story.tags_id,
          tag: story.tag
        });
      };
      res.json(hydRes);
    });
});

app.put('/api/stories/:id', (req, res) => {
  console.log('running put', req.params.id);
  knex('news')
    .where('id', '=', req.params.id)
    .increment('votes', 1)
    .then(res.sendStatus(204));
})

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
