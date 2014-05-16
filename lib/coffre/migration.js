var RSVP = require('rsvp');

var Migration = function(connection) {
  this.connection = connection;
};

Migration.DATA_TYPES = {
  string: 'TEXT',
  text: 'TEXT',
  integer: 'INTEGER',
  real: 'REAL',
  blob: 'BLOB',
  date: 'INTEGER',
  time: 'INTEGER'
};

function prepareCreateTableStatement(tableName, columns, tableOptions) {
  var columnOptions = [{
    type: 'integer',
    name: 'id',
    primaryKey: true
  }];

  for (var columnName in columns) {
    var columnOption = {};
    
    if (typeof columns[columnName] === 'string') {
      columnOption['type'] = columns[columnName];
    }
    else {
      columnOption = columns[columnName];
    }

    columnOption['name'] = columnName;
    columnOption['type'] = columnOption['type'];

    columnOptions.push(columnOption);
  }

  if (tableOptions['useTimestamps'] === true) {
    columnOptions.push({
      type: 'date',
      name: 'createdAt'
    });

    columnOptions.push({
      type: 'date',
      name: 'updatedAt'
    });
  }

  var columnStatements = [];

  for (var i = 0; i < columnOptions.length; i++) {
    var columnOption = columnOptions[i],
        columnStatement = columnOption['name'] + ' ' + Migration.DATA_TYPES[columnOption['type']];

    if (columnOption['primaryKey'] === true) {
      columnStatement += ' PRIMARY KEY';
    }

    if (columnOption['default'] !== undefined) {
      if (typeof columnOption['default'] === 'string' || typeof columnOption['default'] === 'integer') {
        columnStatement += ' DEFAULT ' + JSON.stringify(columnOption['default']);
      }
    }

    columnStatements.push(columnStatement);
  }

  return 'CREATE TABLE IF NOT EXISTS ' + tableName + '(\n' + columnStatements.join(',\t\n') + '\n);';
};

Migration.prototype.up = function(up, version) {
  var database = this.connection.database,
      up = up.bind(this);
  
  console.log('up: ' + version);

  var promise = new RSVP.Promise(function(resolve, reject) {
    try {
      database.serialize();
      database.run('CREATE TABLE IF NOT EXISTS coffre_migrations (version TEXT);');
      up();
      console.log('Starting:', 'INSERT INTO coffre_migrations VALUES ("' + version + '")');
      database.run('INSERT INTO coffre_migrations VALUES ("' + version + '")');
      console.log('Finishing:', 'INSERT INTO coffre_migrations VALUES ("' + version + '")');
      resolve(version);
    }
    catch(e) {
      reject(e);
    }
    finally {
      // database.parallelize();
    }
  });

  return promise;
};

Migration.prototype.down = function(down, version) {
  var database = this.connection.database,
      down = down.bind(this);
  
  console.log('down: ' + version);

  var promise = new RSVP.Promise(function(resolve, reject) {
    try {
      database.serialize();
      database.run('CREATE TABLE IF NOT EXISTS coffre_migrations (version TEXT);');
      down();
      console.log('Starting:', 'DELETE FROM coffre_migrations WHERE version="' + version + '"');
      database.run('DELETE FROM coffre_migrations WHERE version="' + version + '"');
      console.log('Finishing:', 'DELETE FROM coffre_migrations WHERE version="' + version + '"');
      resolve(version);
    }
    catch(e) {
      reject(e);
    }
    finally {
      // database.parallelize();
    }
  });

  return promise;
};

Migration.prototype.createTable = function(tableName, columns, tableOptions) {
  var database = this.connection.database,
      statement = prepareCreateTableStatement(tableName, columns, tableOptions);
  database.serialize();
  console.log('CREATE TABLE: ', tableName);
  console.log('.........................');
  console.log('\t', statement);
  database.run(statement, function(error, rows) {
    console.log(rows);
  });
  console.log('.........................');
};

Migration.prototype.dropTable = function(tableName) {
  var database = this.connection.database;
  database.serialize();
  console.log('DROP TABLE: ', tableName);
  // database.run(prepareCreateTableStatement(tableName, columns, tableOptions));
};

module.exports = Migration;