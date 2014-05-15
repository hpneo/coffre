var Relation = function() {};

Relation.prototype = Array.prototype;

Relation.prototype.first = function() {
  return this[0];
};

Relation.prototype.last = function() {
  return this[this.length - 1];
};

module.exports = Relation;