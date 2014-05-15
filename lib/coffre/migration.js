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

Migration.prototype.createTable = function(tableName, columns, tableOptions) {
  var database = this.connection.database;
  database.serialize(function() {
    database.run(prepareCreateTableStatement(tableName, columns, tableOptions));
  });
};

Migration.prototype.dropTable = function(tableName) {
  var database = this.connection.database;

  database.serialize(function() {
    database.run('DROP TABLE ' + tableName);
  });
};

module.exports = Migration;