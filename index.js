var Inflector = require('inflector');

var mappedModels = {},
    Coffre = {};

function setTableName(tableName) {
  this.tableName = tableName;
}

function getTableName() {
  return this.tableName;
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

    for (var i in baseAttributes) {
      this.attributes[i] = baseAttributes[i];
    }
  };

  newModel.prototype = ModelPrototype;

  newModel.getTableName = getTableName;
  newModel.setTableName = setTableName;

  newModel.setTableName(modelName.plural());

  if (modelOptions !== undefined) {
    modelOptions.call(newModel);
  }

  mappedModels[newModel.getTableName()] = newModel;

  return newModel;
};

Coffre.getModels = function() {
  return mappedModels;
}

module.exports = Coffre;