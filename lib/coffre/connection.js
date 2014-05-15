var path = require('path'),
    fs = require('fs'),
    sqlite3 = require('sqlite3').verbose();

var Connection = function(environment) {
  var ENV = environment || process.env.NODE_ENV || 'development',
      basePath = path.dirname((module.parent.parent.parent || module.parent.parent).filename),
      configurationPath = basePath + '/config/database.json';
  
  if (fs.existsSync(configurationPath)) {
    this.configuration = require(configurationPath)[ENV];
  }
  else{
    throw new Error('Must create a database.json file in /config'.red);
  }

  this.database = new sqlite3.Database(path.join(basePath, 'db', this.configuration.database));
};

module.exports = Connection;