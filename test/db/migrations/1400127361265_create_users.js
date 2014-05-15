module.exports = {
  up: function() {
    this.createTable('users', {
      firstName: 'string',
      lastName: 'string',
      email: 'string'
    }, {
      useTimestamps: true
    });

    this.createTable('users_users', {
      firstName: 'string',
      lastName: 'string',
      email: 'string'
    }, {
      useTimestamps: true
    });
  },
  down: function() {
    this.dropTable('users');
    this.dropTable('users_users');
  }
};