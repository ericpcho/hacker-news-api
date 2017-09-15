const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { DATABASE } = require('./config');
const knex = require('knex')(DATABASE);

// ADD YOUR ENDPOINTS HERE

router.post('/', jsonParser, (req, res) => {
  let newId;
  console.log('running post');
  console.log(req.body);
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

// router.get('/', (req, res) => {
//   console.log('running get');
//   knex.select()
//     .from('news')
//     .orderBy('title')
//     .then(results => res.json(results));
// });

router.get('/', (req, res) => {
  console.log('running get');
  knex.select('news.id', 'title', 'url', 'votes', 'tags.id', 'tag', 'tags_id as tagId', 'news_id')
    .from('news')
    .join('news_tags', 'news.id', 'news_tags.news_id')
    .join('tags', 'news_tags.tags_id', 'tags.id')
    .orderBy('news_id')
    .then(results => {
      const hydRes = [], lookup = {};
      for (let story of results) {
        if (!lookup[story.news_id]) {
          lookup[story.news_id] = {
            id: story.news_id,
            title: story.title,
            url: story.url,
            votes: story.votes,
            tags: []
          };
          hydRes.push(lookup[story.news_id]);
        }
        lookup[story.news_id].tags.push({
          id: story.tagId,
          tag: story.tag
        });
      };
      res.json(hydRes);
    });
});

router.put('/:id', (req, res) => {
  console.log('running put', req.params.id);
  knex('news')
    .where('id', '=', req.params.id)
    .increment('votes', 1)
    .then(res.sendStatus(204));
})

module.exports = router;