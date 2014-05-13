var Coffre = require(__dirname + '/../index');
var expect = require('chai').expect;

describe('Coffre', function() {
  it('should build models', function() {
    var User = Coffre.build('User');

    expect(User.getTableName()).to.equal('users');
  });

  it('should build models with extra options', function() {
    var User = Coffre.build('User', function() {
      this.setTableName('users_users');
    });

    expect(User.getTableName()).to.equal('users_users');
  });

  it('should allow build instances of existing models', function() {
    var User = Coffre.build('User');

    var hpneo = new User({
      firstName: 'Gustavo',
      lastName: 'Leon',
      email: 'hpneo@hotmail.com'
    });

    expect(hpneo.get('firstName')).to.equal('Gustavo');
  });
});