'use strict';

require('dotenv').config()

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const { DATABASE, PORT } = require('../config');
const knex = require('knex')(DATABASE);
const { app, runServer, closeServer } = require('../server');


chai.use(chaiHttp);

describe('Hacker News API', function () {

  before(function () {
    return runServer();
  });

  beforeEach(function () {
    // return Promise.all([knex.schema.dropTableIfExists('news_tags'), knex.schema.dropTableIfExists('news'), knex.schema.dropTableIfExists('tags')])
    return knex.schema.dropTableIfExists('news_tags')
    .then(() => {return Promise.all([knex.schema.dropTableIfExists('news'), knex.schema.dropTableIfExists('tags')])})

      .then(() => knex.schema.createTableIfNotExists('news', function (table) {
        table.increments('id').primary();
        table.string('title');
        table.string('url');
        table.integer('votes', 0)
      }))

      .then(() => knex('news').insert([{
        title: 'NYTIMES',
        url: "https://www.nytimes.com/",
      },
      {
        title: 'REDDIT',
        url: "https://www.reddit.com/",
      },
      {
        title: 'YAHOO',
        url: "https://www.yahoo.com/",
      }]))

      .then(() => knex.schema.createTableIfNotExists('tags', function (table) {
        table.increments('id').primary();
        table.string('tag');
      }))

      .then(() => knex('tags').insert([{
        tag: 'news'
      },
      {
        tag: 'travel'
      },
      {
        tag: 'weather'
      },
      {
        tag: 'health'
      },
      {
        tag: 'lifestyle'
      }
    ]))
      
      .then(() => knex.schema.createTableIfNotExists('news_tags', function (table) {
          table.integer('news_id');
          table.integer('tags_id');
        }))

      .then(() => knex('news_tags').insert([{
        news_id: 1,
        tags_id: 1
      },
      {
        news_id: 1,
        tags_id: 5
      },
      {
        news_id: 2,
        tags_id: 1
      },
      {
        news_id: 3,
        tags_id: 2
      },
      {
        news_id: 3,
        tags_id: 3
      }]))
       
  });

  // afterEach(function () {
  //   knex.schema.dropTableIfExists('news')
  // });

  after(function () {
    return closeServer();
  });

  describe('Starter Test Suite', function () {

    it('should be true', function () {
      true.should.be.true;
    });

    it('should list stories on GET', function () {
      return chai.request(app)
        .get('/api/stories')
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('array');
          res.body.length.should.equal(3);
          res.body.forEach(function (story) {
            story.should.be.an('object');
            story.should.include.keys(['id', 'title', 'url', 'votes', 'tags']);
            story.tags.should.be.an('array');
            story.tags.forEach(function (tag) {
              tag.should.be.an('object');
              tag.should.include.keys(['id', 'tag'])
            })
          })
        })
    })

    it('should updated items on PUT', function() {

      return chai.request(app)
      knex('news')
        .select('votes')
        .where("id", 2)
      .then(function(res) {
        
        return chai.request(app)
          .put(`/api/stories/2`)
          .then(function(res) {
            res.should.have.status(204);
          })
      })
  })
    

    // it('should add an item on POST', function() {
    //   const postNews = {title: 'GITHUB', url: 'https://github.com/'};
    //   return chai.request(app)
    //     .post('/api/stories')
    //     .send(postNews)
    //     .then(function(res) {
    //       res.should.have.status(201);
    //       res.should.be.json;
    //       res.body.should.be.a('object');
    //     })
    // })

  });
}); 