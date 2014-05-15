var Inflector = require('inflecta');
require('colors');

var Coffre = {
  Connection : require('./coffre/connection'),
  Relation : require('./coffre/relation'),
  MigrationManager : require('./coffre/migration_manager')
};

var mappedModels = {},
    SQL = {
      tableExists: 'SELECT name FROM sqlite_master WHERE type = ? AND name = ?;',
      describleTable: 'PRAGMA table_info(?);'
    };

function setTableName(tableName) {
  this.tableName = tableName;
}

function getTableName() {
  return this.tableName;
}

function hasMany(many, manyOptions) {
  manyOptions = manyOptions || {};

  var manyPropertyModel = (mappedModels[Inflector.tableize(many)] || {})['model'] || manyOptions['model'],
    manyPropertyName = manyOptions['as'] || many;

  this.associations.hasMany[many] = {
    model: manyPropertyModel,
    as: manyPropertyName
  };

  Object.defineProperty(this.prototype, manyPropertyName, {
    configurable: false,
    enumerable: true,
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

  var belongsToPropertyModel = (mappedModels[Inflector.tableize(belongsTo)] || {})['model'] || belongsToOptions['model'],
      belongsToPropertyName = belongsToOptions['as'] || belongsTo;

  this.associations.belongsTo[belongsTo] = {
    model: belongsToPropertyModel,
    as: belongsToPropertyName
  };

  Object.defineProperty(this.prototype, belongsToPropertyName, {
    configurable: false,
    enumerable: true,
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

  newModel.prototype = {};
  newModel.prototype.get = ModelPrototype.get;
  newModel.prototype.set = ModelPrototype.set;

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
  mappedModels[newModel.getTableName()] = {};
  mappedModels[newModel.getTableName()]['model'] = newModel;

  if (modelOptions !== undefined) {
    modelOptions.call(newModel);
  }

  if (newModel.connection.database.open === true) {
    Coffre.tableExists(newModel, function() {
      if (!newModel.isMapped) {
        throw new Error('Table ' + newModel.getTableName() + ' does not exist');
      }
      // console.log(modelName + '.isMapped', newModel.isMapped);
    });
  }

  newModel.connection.database.on('open', function() {
    Coffre.tableExists(newModel, function() {
      if (!newModel.isMapped) {
        throw new Error('Table ' + newModel.getTableName() + ' does not exist');
      }
      // console.log(modelName + '.isMapped', newModel.isMapped);
    });
  });

  return newModel;
};

Coffre.getConnection = function(env) {
  if (this.connection === undefined) {
    this.connection = new Coffre.Connection(env || Coffre.ENV);
  }

  return this.connection;
};

Coffre.mapModelFromTable = function(model) {

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

Coffre.clearModels = function() {
  for (var i in mappedModels) {
    delete mappedModels[i];
  }
  
  mappedModels = {};
};


module.exports = Coffre;