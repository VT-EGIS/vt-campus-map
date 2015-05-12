define([], function () {
  var exceptions;

  exceptions = {
    ValueError: function (message) {
      this.name = 'ValueError';
      this.message = message;
    }
  };

  for(var name in exceptions) {
    exceptions[name].prototype = Error.prototype;
  }

  return exceptions;
});
