require('inflector');
var path = require('path');
var Connection = require(__dirname + '/lib/connection');

var mappedModels = {},
    Coffre = {};

var SQL = {
  tableExists: 'SELECT name FROM sqlite_temp_master WHERE type = ? AND name = ?;'
};

function setTableName(tableName) {
  this.tableName = tableName;
}

function getTableName() {
  return this.tableName;
}

function defineProperties(modelPrototype) {};

var ModelPrototype = {
  get: function(attribute) {
    return this.attributes[attribute];
  },
  set: function(attribute, value) {
    this.attributes[attribute] = value;
  }
};

Coffre.getConnection = function(env) {
  if (this.connection === undefined) {
    this.connection = new Connection(env || Coffre.ENV);
  }

  return this.connection;
};

Coffre.tableExists = function(model, callback) {
  model.connection.database.get(SQL.tableExists, ['table', model.getTableName()], function(error, rows) {
    if (error === null && rows === undefined) {
      model.isMapped = false;
    }
    else {
      model.isMapped = true;
    }

    callback(model);
  });
}

Coffre.build = function() {
  var modelName = arguments[0],
      modelOptions = arguments[1];

  if (modelName === undefined || modelName === "") {
    throw new Error('Must set a model name');
  }

  if (modelOptions !== undefined && !(modelOptions instanceof Function)) {
    throw new Error('Must set the model options as a function');
  }

  var newModel = function Model(baseAttributes) {
    this.attributes = {};

    for (var i in baseAttributes) {
      this.attributes[i] = baseAttributes[i];
    }
  };

  newModel.prototype = ModelPrototype;

  newModel.getTableName = getTableName;
  newModel.setTableName = setTableName;
  newModel.connection = Coffre.getConnection();

  newModel.setTableName(modelName.plural());

  if (modelOptions !== undefined) {
    modelOptions.call(newModel);
  }

  if (newModel.connection.database.open === true) {
    Coffre.tableExists(newModel, function() {
      console.log(modelName + '.isMapped', newModel.isMapped);
    });
  }

  newModel.connection.database.on('open', function() {
    Coffre.tableExists(newModel, function() {
      console.log(modelName + '.isMapped', newModel.isMapped);
    });
  });

  mappedModels[newModel.getTableName()] = newModel;

  return newModel;
};

Coffre.getModels = function() {
  return mappedModels;
}

module.exports = Coffre;