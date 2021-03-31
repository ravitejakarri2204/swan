const supertest = require("supertest");
const assert = require('assert');
const app = require("../../index");
require('mongoose').set('debug', true);
describe("Users /", function() {
	before(function() {
		require('../../services/dbhelper').delete("users", {
			query: {
				username: "username"
			}
		});
  	});

  it("it should has status code 400", function(done) {
    supertest(app)
      .post("/users/register")
      .expect(400)
      .end(function(err, res){
        if (err) done(err);
        done();
      });
  });
  it("username check", function(done) {
  	const expectedResult = 'Mandatory fields not provided';

    supertest(app)
      .post("/users/register")
      .send({
      	password: "password"
      })
      .expect(400)
      .end(function(err, res){
        if (err) done(err);
        assert.ok(res.text.includes(expectedResult));
        done();
      });
  });
  it("password check", function(done) {
  	const expectedResult = 'Mandatory fields not provided';

    supertest(app)
      .post("/users/register")
      .send({
      	username: "username"
      })
      .expect(400)
      .end(function(err, res){
        if (err) done(err);
        assert.ok(res.text.includes(expectedResult));
        done();
      });
  });
  it("validation check", function(done) {
  	const expectedResult = 'User validation failed: gender: Invalid Gender found';

    supertest(app)
      .post("/users/register")
      .send({
      	username: "username",
      	password: "password"
      })
      .expect(400)
      .end(function(err, res){
        if (err) done(err);
        assert.ok(res.text.includes(expectedResult));
        done();
      });
  });
  it("successful addition", function(done) {
  	const expectedResult = 'success';

    supertest(app)
      .post("/users/register")
      .send({
		"username": "username",
		"password": "12345678",
		"gender": "F",
		"role": "client",
		"name": "Ravi",
		"email": "ravi@gmail.com",
		"mobileNo": 1234567890
		})
      .expect(200)
      .end(function(err, res){
        if (err) done(err);
        assert.ok(res.text.includes(expectedResult));
        done();
      });
  });
  it("it should has status code 400", function(done) {
  	const expectedResult = 'E11000 duplicate key error collection';

    supertest(app)
      .post("/users/register")
      .send({
		"username": "ravi",
		"password": "12345678",
		"gender": "F",
		"role": "client",
		"name": "Ravi",
		"email": "ravi@gmail.com",
		"mobileNo": 1234567890
		})
      .expect(400)
      .end(function(err, res){
        if (err) done(err);
        assert.ok(res.text.includes(expectedResult));
        done();
      });
  });
});
