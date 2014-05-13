var path = require('path'),
    fs = require('fs'),
    sqlite3 = require('sqlite3').verbose();

var Connection = function(environment) {
  var ENV = environment || 'development',
      basePath = path.dirname((module.parent.parent || module.parent).filename),
      configurationPath = basePath + '/config/database.json';

  if (fs.existsSync(configurationPath)) {
    this.configuration = require(configurationPath)[environment];
  }
  else{
    throw new Error('Must create a database.json configuration file in /config');
  }

  this.database = new sqlite3.Database(path.join(basePath, 'db', this.configuration.database));
};

module.exports = Connection;