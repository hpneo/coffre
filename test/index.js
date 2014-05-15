var Coffre = require(__dirname + '/../index');
Coffre.ENV = 'test';
var expect = require('chai').expect;

describe('Coffre', function() {
  before(function() {
    Coffre.MigrationManager.runMigration('1400127361265', 'up');
    Coffre.MigrationManager.runMigration('1400139025169', 'up');
  });

  beforeEach(function() {
    Coffre.clearModels();
  });
  
  it('should build models', function() {
    var User = Coffre.build('User'),
        Blog = Coffre.build('Blog');

    expect(User.getTableName()).to.equal('users');
    expect(Blog.getTableName()).to.equal('blogs');
  });

  it('should build models with extra options', function() {
    var User = Coffre.build('User', function() {
          this.setTableName('users_users');
        }),
        Blog = Coffre.build('Blog', function() {
          this.setTableName('blogs_blogs');
        });

    expect(User.getTableName()).to.equal('users_users');
    expect(Blog.getTableName()).to.equal('blogs_blogs');
  });

  it('should allow build instances of existing models', function() {
    var User = Coffre.build('User'),
        Blog = Coffre.build('Blog');

    var hpneo = new User({
      firstName: 'Gustavo',
      lastName: 'Leon',
      email: 'hpneo@hotmail.com'
    });

    var rsi = new Blog({
      title: 'Reflexiones sin importancia'
    });

    expect(hpneo.get('firstName')).to.equal('Gustavo');
    expect(rsi.get('title')).to.equal('Reflexiones sin importancia');
  });
});