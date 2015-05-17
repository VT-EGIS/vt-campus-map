define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
], function (declare, _WidgetBase, _TemplatedMixin) {
  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: '<a href="#" class="list-group-item" data-dismiss="modal"> ${name} </a>',
  });
});
