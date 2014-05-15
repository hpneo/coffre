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

  it('should build models with associations', function() {
    var User = Coffre.build('User', function() {
          this.hasMany('blogs');
        }),
        Blog = Coffre.build('Blog', function() {
          this.belongsTo('user');
        });

    var hpneo = new User({
      firstName: 'Gustavo',
      lastName: 'Leon',
      email: 'hpneo@hotmail.com'
    });

    var rsi = new Blog({
      title: 'Reflexiones sin importancia'
    });

    expect(hpneo.blogs).to.be.an.instanceOf(Coffre.Relation);
    expect(rsi.user).to.be.an.instanceOf(Coffre.Relation);
  });

  it('should build models with associations and custom names', function() {
    var User = Coffre.build('User', function() {
          this.hasMany('blogs', { as : 'publications' });
        }),
        Blog = Coffre.build('Blog', function() {
          this.belongsTo('user', { as : 'author' });
        });

    var hpneo = new User({
      firstName: 'Gustavo',
      lastName: 'Leon',
      email: 'hpneo@hotmail.com'
    });

    var rsi = new Blog({
      title: 'Reflexiones sin importancia'
    });

    expect(hpneo.blogs).to.be.undefined;
    expect(rsi.user).to.be.undefined;

    expect(hpneo.publications).to.be.an.instanceOf(Coffre.Relation);
    expect(rsi.author).to.be.an.instanceOf(Coffre.Relation);
  });
});