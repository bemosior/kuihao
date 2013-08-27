var isBlank = function(str) {
  return (str == null) || (/^\s*$/.test(str));
}

var kuihaoApp = angular.module('kuihaoApp', [], function() {
});

kuihaoApp.controller('MainCtrl', function($scope) {

  var drag_move = function (dx, dy) {
    var att;
    switch (this.type) {
      case "rect":
        var nextx = this.ox + dx;
        if (nextx < 0) nextx = 0;
        if (nextx + 60 > 640) nextx = 640-60;
        var nexty = this.oy + dy;
        if (nexty < 0) nexty = 0;
        if (nexty + 40 > 480) nexty = 480-40;
        att = {x: nextx, y: nexty};
        break;
      case "circle":
        var nextx = this.ox + dx;
        if (nextx < 0) nextx = 0;
        if (nextx + 60 > 640) nextx = 640-60;
        var nexty = this.oy + dy;
        if (nexty < 0) nexty = 0;
        if (nexty + 40 > 480) nexty = 480-40;
        att = {cx: nextx, cy: nexty};
        break;
      default:
        break;
    };
    this.attr(att);
  };

  var drag_start = function() {
    switch (this.type) {
      case "rect":
        this.ox = this.attr("x");
        this.oy = this.attr("y");
        break;
      case "circle":
        this.ox = this.attr("cx");
        this.oy = this.attr("cy");
      default:
        break;
    };
  };

  var display_info = function() {
    switch (this.type) {
      case "rect":
        $scope.$apply(function($scope) {
          $scope.info = "stuff!";
        });
        break;
      default:
        break;
    };
  };

  var display_clear = function() {
    $scope.$apply(function($scope) {
      $scope.info = "";
    });
  };

  var draw_workcenter = function(wc) {
    var ret = r.set()
    ret.push(
      r.rect( 320, 240, 60, 40, 10 )
    );
    var offset = -wc.inputs.length/2*30
    for (var i=0; i < wc.inputs.length; i++) {
      ret.push(r.circle(300, 260+offset*i, 10));
    };
    for (var i=0; i < wc.outputs.length; i++) {
      ret.push(r.circle(400, 260, 10));
    };
    console.log(ret);
    return ret;
  };

  var r = Raphael("floor", 640, 480);

  var state = "normal";

  var floor = r.rect( 0, 0, 640, 480);

  var workCenters      = [{
    "name": "workcenter1",
    "inputs": [
      "server",
      "license",
    ],
    "outputs": [
      "server/licensed",
    ]
  }];
  var workCenterShapes = [];
  var products         = [{"p1":"1"}];
  var productShapes    = [];

  var workCenterColor  = Raphael.getColor();
  Raphael.getColor(); Raphael.getColor(); Raphael.getColor();
  var productColor     = Raphael.getColor();

  draw_workcenter(workCenters[0]);
  for (var i=0; i < workCenters.length; i++) {
    workCenterShapes.push(
      r.rect(290, 80, 60, 40, 10)
        .attr({
          fill: workCenterColor,
          stroke: workCenterColor,
          "fill-opacity": 1,
          "stroke-width": 2,
          "cursor" : "move",
        })
        .drag(drag_move, drag_start)
        .hover(display_info, display_clear)
    )
  };

  for (var i=0; i < products.length; i++) {
    productShapes.push(
      r.circle( 50, 50, 10)
        .attr({
          fill: productColor,
          stroke: productColor,
          "fill-opacity": 1,
          "stroke-width": 2,
          "cursor" : "move",
        })
        .drag(drag_move, drag_start)
    );
  }

  $scope.addWorkCenter = function() {
    workCenters.push({
      "wcname": "new wc " + Math.floor(Math.random()*10000 + 1),
    });
    workCenterShapes.push(
      r.rect(260, 220, 60, 40, 10)
        .attr({
          fill: workCenterColor,
          stroke: workCenterColor,
          "fill-opacity": 1,
          "stroke-width": 2,
          "cursor" : "move",
        })
        .drag(drag_move, drag_start)
        .hover(display_info, display_clear)
    );
  };

  $scope.addProduct = function() {
    products.push({
      "pnew": "2"
    })
    productShapes.push(
      r.circle( 50, 50, 10)
        .attr({
          fill: productColor,
          stroke: productColor,
          "fill-opacity": 1,
          "stroke-width": 2,
          "cursor" : "move",
        })
        .drag(drag_move, drag_start)
    );
  };

});
