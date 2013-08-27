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

  var floorDiagram;
  var workCenters, workCenterShapes;
  var products, productShapes;
  var floor;

  var state = "normal";

  var workCenterColor  = Raphael.getColor();
  Raphael.getColor(); Raphael.getColor(); Raphael.getColor();
  var productColor     = Raphael.getColor();

  var drawProducts = function() {
    for (var i=0; i < products.length; i++) {
      productShapes.push(
        floorDiagram.circle( products[i].loc[0], products[i].loc[1], 10)
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
  };

  var drawWorkCenters = function() {
    for (var i=0; i < workCenters.length; i++) {
      workCenterShapes.push(
        floorDiagram.rect(workCenters[i].loc[0], workCenters[i].loc[1], 60, 40, 10)
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
  };

  var drawConnections = function() {
  };

  $scope.resetInit = function() {
    if ((typeof floorDiagram === 'undefined') || (floorDiagram === null)) {
      floorDiagram = Raphael("floor", 640, 480);
    };
    floorDiagram.clear();
    /*
    workCenters = [];
    workCenterShapes = [];
    products = [];
    productShapes = [];
    */
    products = [
      {
        id: "7a5041e6-8f92-4bf6-b962-9f75bf9c070d",
        name: "blade",
        loc: [100,200],
      },
      {
        id: "eaef65f2-0369-4d05-ace5-123e33486373",
        name: "oslicense",
        loc: [200,100],
      },
    ]
    productShapes = [];
    workCenters = [
      {
        id: "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a",
        inputs: ["blade", "oslicense"],
        inputItems: ["7a5041e6-8f92-4bf6-b962-9f75bf9c070d", "eaef65f2-0369-4d05-ace5-123e33486373"],
        outputs: ["blade w/ oslicense"],
        loc: [200,200],
      },
      {
        id: "d8e5fa43-63d3-4228-9c93-ff1c64d2371b",
        inputs: ["blade w/ oslicense"],
        inputItems: ["4eb234b0-9ea4-45a7-82ec-3f7dd60db20a"],
        outputs: ["blade w/ os installed"],
        loc: [300,300],
      },
    ]
    workCenterShapes = [];
    floor = floorDiagram.rect( 0, 0, 640, 480);
    drawProducts();
    drawWorkCenters();
    drawConnections();
  }

  $scope.addWorkCenter = function() {
    workCenters.push({
      "wcname": "new wc " + Math.floor(Math.random()*10000 + 1),
    });
    workCenterShapes.push(
      floorDiagram.rect(260, 220, 60, 40, 10)
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
      floorDiagram.circle( 50, 50, 10)
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
