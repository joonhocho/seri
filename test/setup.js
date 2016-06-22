var chai = require('chai');
chai.use(require('chai-as-promised'));

if (typeof Promise === 'undefined') {
  require('es6-promise').polyfill();
}
