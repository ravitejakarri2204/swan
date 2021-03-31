var config = require('./config.js');
var mongoose = require('mongoose');
var dbURI = config.connectionString;
var dbHandle;
var initDB = async function () {
  process.setMaxListeners(0);
  mongoose.set('debug', true);

  // mongoose.Promise = require('q').Promise;
  dbHandle = mongoose.createConnection(dbURI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false, });

  dbHandle.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI);
  });

  dbHandle.on('error', function (err) {
    console.log('Mongoose connection error ' + err);
  });

  dbHandle.on('disconnected', function () {
    console.log('Mongoose disconnected');
  });

  process.on('SIGINT', function () {
    dbHandle.close(function () {
      console.log('Mongoose disconnected through app termination');
      process.exit(0);
    });
  });
}

var getDbHandle = function() {
  return dbHandle;
}

module.exports = {
  'init': initDB,
  'connection': getDbHandle
}
