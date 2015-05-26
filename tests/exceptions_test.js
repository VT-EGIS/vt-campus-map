define([
    'intern!object',
    'intern/chai!assert',
    'vtCampusMap/exceptions'
], function (registerSuite, assert, Exceptions) {
  registerSuite({
    name: 'Exceptions',

    ValueError: function () {
      var exception;

      exception = new Exceptions.ValueError('This is the message');

      assert.strictEqual(exception.toString(), 'ValueError: This is the message');
    }
  });
}); 
