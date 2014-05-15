module.exports = {
  up: function() {
    this.createTable('blogs', {
      title: 'string'
    }, {
      useTimestamps: true
    });

    this.createTable('blogs_blogs', {
      title: 'string'
    }, {
      useTimestamps: true
    });
  },
  down: function() {
    this.dropTable('blogs');
    this.dropTable('blogs_blogs');
  }
};