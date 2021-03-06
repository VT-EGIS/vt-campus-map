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
    clickEvent: function () {
      var evt;

      evt = document.createEvent('MouseEvent');
      evt.initMouseEvent('click', true, false);
      return evt;
    },
    changeEvent: function () {
      var evt;

      evt = document.createEvent('HTMLEvents');
      evt.initEvent('change', true, false);
      return evt;
    },
    keyupEvent: function () {
      var evt;

      evt = document.createEvent('KeyboardEvent');
      evt.initEvent('keyup', true, false);
      return evt;
    }
  };
});
