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
   return knex.schema.dropTableIfExists('news')
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
    
    it('should list stories on GET', function() {
      return chai.request(app)
      .get('/api/stories')
      .then(function(res){
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.length.should.equal(3);
          const expectedKeys = ['id', 'title', 'url', 'votes'];
            res.body.forEach(function(item) {
              item.should.be.a('object');
              item.should.include.keys(expectedKeys);
            })
      })
    })

  it('should updated items on PUT', function() {
    const updateData = {
      title: "WEATHER",
      url: "https://weather.com/"
    }

    return chai.request(app)
    .get('/api/stories')
    .then(function(res) {
      updateData.id = res.body[0].id;
      return chai.request(app)
        .put(`/api/stories/${updateData.id}`)
        .send(updateData);
    })
    .then(function(res) {
      res.should.have.status(204);
    })
  })

    it('should add an item on POST', function() {
      const postNews = {title: 'GITHUB', url: 'https://github.com/'};
      return chai.request(app)
        .post('/api/stories')
        .send(postNews)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('array');
        })
    })

  });
}); 