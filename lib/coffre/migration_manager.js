var path = require('path'),
    fs = require('fs'),
    glob = require('glob'),
    Connection = require('./connection'),
    Migration = require('./migration');

var connection = new Connection();

var basePath = path.dirname((module.parent.parent.parent || module.parent.parent).filename),
    migrationsPath = path.join(basePath, 'db', 'migrations');

var MigrationManager = {};

MigrationManager.runMigration = function(migrationName, direction) {
  direction = direction || 'up';
  if (!fs.existsSync(migrationsPath)) {
    throw new Error('Must create a "migrations" directory in /db'.red);
  }

  glob(path.join(migrationsPath, migrationName) + '*.js', {}, function(error, files) {
    if (error === null && files.length > 0) {
      var migration = require(files[0]);

      connection.database.on('open', function() {
        migration[direction].call(new Migration());
      });

      if (connection.database.open === true) {
        migration[direction].call(new Migration(connection));
      }
    }
  });
};

module.exports = MigrationManager;