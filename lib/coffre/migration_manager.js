var path = require('path'),
    fs = require('fs'),
    glob = require('glob'),
    Connection = require('./connection'),
    Migration = require('./migration'),
    RSVP = require('rsvp');

var connection = new Connection();

var basePath = path.dirname((module.parent.parent.parent || module.parent.parent).filename),
    migrationsPath = path.join(basePath, 'db', 'migrations');

var MigrationManager = {};

MigrationManager.runMigration = function(migrationName, direction) {
  direction = direction || 'up';
  if (!fs.existsSync(migrationsPath)) {
    throw new Error('Must create a "migrations" directory in /db'.red);
  }

  var deferred = RSVP.defer();

  glob(path.join(migrationsPath, migrationName) + '*.js', {}, function(error, files) {
    if (error === null && files.length > 0) {
      var migrationOperation = require(files[0])[direction],
          migration = new Migration(connection);

      connection.database.on('open', function() {
        migration[direction](migrationOperation, migrationName).then(deferred.resolve, deferred.reject);
      });

      if (connection.database.open === true) {
        migration[direction](migrationOperation, migrationName).then(deferred.resolve, deferred.reject);
      }
    }
    else {
      deferred.reject(error);
    }
  });

  return deferred.promise;
};

MigrationManager.close = function() {
  connection.database.close();
};

module.exports = MigrationManager;