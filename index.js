require('colors');

var Inflector = require('inflecta'),
    path = require('path'),
    Connection = require(__dirname + '/lib/connection');

var mappedModels = {},
    SQL = {
      tableExists: 'SELECT name FROM sqlite_temp_master WHERE type = ? AND name = ?;'
    },
    Coffre = {};

function setTableName(tableName) {
  this.tableName = tableName;
}

function getTableName() {
  return this.tableName;
}

function hasMany(many, manyOptions) {
  manyOptions = manyOptions || {};

  this.associations.hasMany[many] = {
    model: mappedModels[Inflector.tableize(many)] || manyOptions['model'],
    as: many || manyOptions['as']
  };

  Object.defineProperty(this.prototype, (many || manyOptions['as']), {
    configurable: false,
    get: function() {
      if (this.associations.hasMany[many] === undefined) {
        this.associations.hasMany[many] = new Coffre.Relation();
      }

      return this.associations.hasMany[many];
    }
  });
}

function belongsTo(belongsTo, belongsToOptions) {
  belongsToOptions = belongsToOptions || {};

  this.associations.belongsTo[belongsTo] = {
    model: mappedModels[Inflector.tableize(belongsTo)] || belongsToOptions['model'],
    as: belongsTo || belongsToOptions['as']
  };

  Object.defineProperty(this.prototype, (belongsTo || belongsToOptions['as']), {
    configurable: false,
    get: function() {
      if (this.associations.belongsTo[belongsTo] === undefined) {
        this.associations.belongsTo[belongsTo] = new Coffre.Relation();
      }

      return this.associations.belongsTo[belongsTo];
    }
  });
}

var ModelPrototype = {
  get: function(attribute) {
    return this.attributes[attribute];
  },
  set: function(attribute, value) {
    this.attributes[attribute] = value;
  }
};

Coffre.Relation = function() {};

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
    this.associations = {
      hasMany: {},
      belongsTo: {}
    };

    for (var i in baseAttributes) {
      this.attributes[i] = baseAttributes[i];
    }
  };

  newModel.prototype = ModelPrototype;

  newModel.associations = {
    hasMany: {},
    belongsTo: {}
  };

  newModel.getTableName = getTableName;
  newModel.setTableName = setTableName;
  newModel.hasMany = hasMany;
  newModel.belongsTo = belongsTo;

  newModel.connection = Coffre.getConnection();

  newModel.setTableName(Inflector.tableize(modelName));

  if (modelOptions !== undefined) {
    modelOptions.call(newModel);
  }

  if (newModel.connection.database.open === true) {
    Coffre.tableExists(newModel, function() {
      // console.log(modelName + '.isMapped', newModel.isMapped);
    });
  }

  newModel.connection.database.on('open', function() {
    Coffre.tableExists(newModel, function() {
      // console.log(modelName + '.isMapped', newModel.isMapped);
    });
  });

  mappedModels[newModel.getTableName()] = newModel;

  return newModel;
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
};

Coffre.getModels = function() {
  return mappedModels;
};

module.exports = Coffre;