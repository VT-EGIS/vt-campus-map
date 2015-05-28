define([], function () {
  return {
    createFixture: function (id) {
      var body, div;
      div = document.createElement('div');
      div.id = id;
      body = document.getElementsByTagName('body')[0];
      body.appendChild(div);
      return div;
    },
  };
});
