'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();

const { app } = require('../server');

chai.use(chaiHttp);

describe('Hacker News API', function () {
  
  before(function () {

  });
  
  beforeEach(function () {

  });

  afterEach(function () {

  });
  
  after(function () {

  });

  describe('Starter Test Suite', function () {
    
    it('should be true', function () {
      true.should.be.true;
    });
    
  });

}); 