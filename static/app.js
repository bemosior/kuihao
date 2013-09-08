var isBlank = function(str) {
  return (str == null) || (/^\s*$/.test(str));
};

var generateUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

var kuihaoApp = angular.module('kuihaoApp', [], function() {
});

kuihaoApp.controller('MainCtrl', function($scope) {

  var WIDTH = 800;
  var HEIGHT = 300;
  var WORKCENTER = {
    height: 60,
    width: 60,
  };
  var PRODUCT = {
    height: 40,
    width: 40,
  };

  var stations = sampledata.stations();
  var connections = sampledata.connections();

  var stationShapes = [];
  var connectionShapes = [];

  var mode = "normal";
  var selectedStation = null;

  var drag_move = function (dx, dy) {
    var att;
    var loc;
    switch (this.type) {
      case "rect":
        var nextx = this.ox + dx;
        if (nextx < 0) nextx = 0;
        if (nextx + WORKCENTER.width > WIDTH) nextx = WIDTH-WORKCENTER.width;
        var nexty = this.oy + dy;
        if (nexty < 0) nexty = 0;
        if (nexty + WORKCENTER.height > HEIGHT) nexty = HEIGHT-WORKCENTER.height;
        att = {x: nextx, y: nexty};
        loc = [nextx+WORKCENTER.width/2, nexty+WORKCENTER.height/2];
        break;
      case "circle":
        var nextx = this.ox + dx;
        if (nextx < PRODUCT.width/2) nextx = PRODUCT.width/2;
        if (nextx + PRODUCT.width/2 > WIDTH) nextx = WIDTH-PRODUCT.width/2;
        var nexty = this.oy + dy;
        if (nexty < PRODUCT.height/2) nexty = PRODUCT.height/2;
        if (nexty + PRODUCT.height/2 > HEIGHT) nexty = HEIGHT-PRODUCT.height/2;
        att = {cx: nextx, cy: nexty};
        loc = [nextx, nexty];
        break;
      default:
        break;
    };
    this.attr(att);
    this.data("station").loc = loc;
    update_connections(this.data("station"));
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

  var display_station = function(element) {
    if (element.data("station")) {
      var station = element.data("station");
      $scope.$apply(function($scope) {
        $scope.station = station;
        $scope.displayed = station.type;
      });
    };
  };

  var display_clear = function() {
    $scope.$apply(function($scope) {
      $scope.displayed = "none";
      $scope.station   = null;
    });
  };

  var display_editstation = function() {
    $scope.$apply(function($scope) {
      $scope.displayed = "edit" + selectedStation.type;
      $scope.station   = null; // use editStation instead
    });
  };

  var hover_in = function() {
    switch (mode) {
      case "normal":
        display_station(this);
        break;
      case "edit":
        if (selectedStation !== this.data("station")) display_station(this);
        break;
    };
  };

  var hover_out = function() {
    switch (mode) {
      case "normal":
        display_clear();
        break;
      case "edit":
        display_editstation();
        break;
    };
  };

  var dblclick_enter = function() {
    mode = "edit";
    selectedStation = this.data("station");
    $scope.$apply(function($scope) {
      $scope.editstation = selectedStation;
      $scope.displayed = "edit" + selectedStation.type;
    });
    redraw();
  };

  var dblclick_exit = function() {
    mode = "normal";
    selectedStation = null;;
    redraw();
  };

  var dblclick_remove = function() {
    var connection = this.data("connection");
    delete connections[connection.source + "|" + connection.destination];
    this.remove();
    redraw();
  };

  var click_connect = function() {
    if (this.data("station") === selectedStation) return;
    if (this.data("station").type == selectedStation.type) return;
    var source = selectedStation;
    var destination = this.data("station");
    if (connections[source.id + "|" + destination.id] !== undefined) return;
    if (connections[destination.id + "|" + source.id] !== undefined) return;
    connections[source.id + "|" + destination.id] = {
      source: source.id,
      destination: destination.id,
    };
    redraw();
  };

  var floorDiagram;
  var workCenters, workCenterShapes;
  var products, productShapes;
  var connections, connectionShapes;
  var floor;

  var state = "normal";

  var workCenterColor  = Raphael.getColor();
  Raphael.getColor(); Raphael.getColor(); Raphael.getColor();
  var productColor     = Raphael.getColor();

  $scope.addWorkCenter = function() {
    var uuid = generateUUID();
    var wc = {
      id: uuid,
      inputs: [],
      outputs: [],
      loc: [WIDTH/2, HEIGHT/2],
      type: "workcenter",
    };
    stations[uuid] = wc;
    redraw();
  };

  $scope.addProduct = function() {
    var uuid = generateUUID();
    var product = {
      id: uuid,
      name: "",
      loc: [WIDTH/2, HEIGHT/2],
      type: "product",
    };
    stations[uuid] = product;
    redraw();
  };


  var redraw = function() {
    if ((typeof floorDiagram === 'undefined') || (floorDiagram === null)) {
      floorDiagram = Raphael("floor", WIDTH, HEIGHT);
    };
    floorDiagram.clear();
    floor = floorDiagram.rect( 0, 0, WIDTH, HEIGHT);
    stationShapes = [];
    for (var stationId in stations) {
      var station = stations[stationId];
      switch (station.type) {
        case "product":
          stationShapes.push(
            floorDiagram.circle(station.loc[0], station.loc[1], PRODUCT.width/2)
              .attr({
                fill: productColor,
                stroke: productColor,
                "fill-opacity": 1,
                "stroke-width": 2,
                "cursor" : "move",
              })
              .data("station", station)
          );
          station.shape = stationShapes[stationShapes.length-1];
          break;
        case "workcenter":
          stationShapes.push(
            floorDiagram.rect(station.loc[0]-WORKCENTER.width/2, station.loc[1]-WORKCENTER.height/2, WORKCENTER.width, WORKCENTER.height, 5)
              .attr({
                fill: workCenterColor,
                stroke: workCenterColor,
                "fill-opacity": 1,
                "stroke-width": 2,
                "cursor" : "move",
              })
              .data("station", station)
          );
          station.shape = stationShapes[stationShapes.length-1];
          break;
        default:
          break;
      };
    };
    connectionShapes = [];
    for (var connectionId in connections) {
      var connection = connections[connectionId];
      var source = null;
      if (stations[connection.source] !== undefined) {
        source = stations[connection.source].loc;
      };
      var destination = null;
      if (stations[connection.destination] !== undefined) {
        destination = stations[connection.destination].loc;
      };
      if ((source !== null) && (destination !== null)) {
        var pathStr = "M" + source + "L" + destination;
        connectionShapes.push(
          floorDiagram.path(pathStr)
            .toBack()
            .attr({
              "stroke-width": 3,
              "stroke": "#c0c0c0",
            })
            .data("connection", connection)
        );
        lastShape = connectionShapes[connectionShapes.length-1];
        point = lastShape.getPointAtLength(lastShape.getTotalLength()/2);
      };
    };
    setupMode();
  };

  var setupMode = function() {
    stationShapes.forEach(function (stationShape) {
      stationShape.attr({"cursor":"default"});
      stationShape.undrag(drag_move, drag_start);
      stationShape.unhover(hover_in, hover_out);
      //stationShape.undblclick(dblclick_enter);
      //stationShape.undblclick(dblclick_exit);
      //stationShape.unclick(click_connect);
    });
    connectionShapes.forEach(function (connectionShape) {
    });
    switch (mode) {
      case "normal":
        stationShapes.forEach(function (stationShape) {
          stationShape.drag(drag_move, drag_start);
          stationShape.attr({"cursor":"move"});
          stationShape.hover(hover_in, hover_out);
          stationShape.dblclick(dblclick_enter);
        });
        connectionShapes.forEach(function (connectionShape) {
          connectionShape.dblclick(dblclick_remove);
          connectionShape.attr({"cursor":"not-allowed"});
        });
        break;
      case "edit":
        if (selectedStation !== null) {
          selectedStation.shape.attr({
            "stroke": "#daa520",
            "stroke-width": 5,
          });
        };
        stationShapes.forEach(function (stationShape) {
          stationShape.attr({"cursor":"pointer"});
          if (stationShape.data("station") !== selectedStation) {
            stationShape.hover(hover_in, hover_out);
          };
          stationShape.dblclick(dblclick_exit);
          stationShape.click(click_connect);
        });
        connectionShapes.forEach(function (connectionShape) {
        });
        break;
    };
  };

  var update_connections = function(station) {
    for (var connectionShapeId in connectionShapes) {
      var connectionShape = connectionShapes[connectionShapeId];
      var connection = connectionShape.data("connection");
      if ((connection.source == station.id) || (connection.destination == station.id)) {
        var source = stations[connection.source].loc
        var destination = stations[connection.destination].loc
        var pathStr = "M" + source + "L" + destination;
        connectionShape.attr({path: pathStr});
      }
    };
  };

  $scope.resetInit = function() {
    $scope.displayed = "none";
    redraw();
  };

});
