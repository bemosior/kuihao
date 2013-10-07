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
})

kuihaoApp.controller('PickCtrl', function($scope) {
})
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/floor', {templateUrl: 'partials/floor-list.html', controller: 'MainCtrl'})
      .when('/floor/:floorId', {templateUrl: 'partials/floor-show.html', controller: 'MainCtrl'})
      .when('/workcenter', {templateUrl: 'partials/workcenter-list.html', controller: 'WorkCenterCtrl'})
      .when('/workcenter/:workcenterId', {templateUrl: 'partials/workcenter-show.html', controller: 'WorkCenterCtrl'})
    ;
  }]);

kuihaoApp.controller('MainCtrl', function($scope, $routeParams, $location) {

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

  var stations = null;
  var connections = null;

  var stationShapes = [];
  var connectionShapes = [];

  var mode = "normal";
  var selectedStation = null;

  var drag_move = function (dx, dy) {
    var att;
    var loc = [this.oloc[0] + dx, this.oloc[1] + dy];
    switch (this.data("station").type) {
      case "product":
        if (loc[0] < PRODUCT.width/2) loc[0] = PRODUCT.width/2;
        if (loc[0] + PRODUCT.width/2 > WIDTH) loc[0] = WIDTH-PRODUCT.width/2;
        if (loc[1] < PRODUCT.height/2) loc[1] = PRODUCT.height/2;
        if (loc[1] + PRODUCT.height/2 > HEIGHT) loc[1] = HEIGHT-PRODUCT.height/2;
        break;
      case "workcenter":
        if (loc[0] < WORKCENTER.width/2) loc[0] = WORKCENTER.width/2;
        if (loc[0] + WORKCENTER.width/2 > WIDTH) loc[0] = WIDTH-WORKCENTER.width/2;
        if (loc[1] < WORKCENTER.height/2) loc[1] = WORKCENTER.height/2;
        if (loc[1] + WORKCENTER.height/2 > HEIGHT) loc[1] = HEIGHT-WORKCENTER.height/2;
        break;
    };
    this.data("station").loc = loc;
    this.data("set").forEach(function(el) {
      switch (el.type) {
        case "rect":
          el.attr({ x: loc[0]-WORKCENTER.width/2, y: loc[1]-WORKCENTER.height/2 });
          break;
        case "circle":
          el.attr({ cx: loc[0], cy: loc[1] });
          break;
        case "text":
          el.attr({ x: loc[0], y: loc[1] });
          break;
      };
    });
    update_connections(this.data("station"));
  };

  var drag_start = function() {
    this.oloc = this.data("station").loc;
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

  var workCenterColor  = "#bf6b26";
  var productColor     = "#26bf4c";

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
          var set = floorDiagram.set();
          var circle = floorDiagram.circle(station.loc[0], station.loc[1], PRODUCT.width/2)
            .attr({
              fill: productColor,
              stroke: productColor,
              "fill-opacity": 1,
              "stroke-width": 2,
              "cursor" : "move",
            })
            .data("set", set)
            .data("station", station);
          var label = floorDiagram.text(station.loc[0], station.loc[1], station.name)
            .data("set", set)
            .data("station", station);
          set
            .push(circle, label);
          stationShapes.push(set);
          station.shape = set;
          break;
        case "workcenter":
          var set = floorDiagram.set();
          var rect = floorDiagram.rect(station.loc[0]-WORKCENTER.width/2, station.loc[1]-WORKCENTER.height/2, WORKCENTER.width, WORKCENTER.height, 5)
            .attr({
              fill: workCenterColor,
              stroke: workCenterColor,
              "fill-opacity": 1,
              "stroke-width": 2,
              "cursor" : "move",
            })
            .data("set", set)
            .data("station", station);
          var label = floorDiagram.text(station.loc[0], station.loc[1], station.name)
            .data("set", set)
            .data("station", station);
          set
            .push(rect, label);
          stationShapes.push(set);
          station.shape = set;
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
          selectedStation.shape.forEach(function (el) {
            if (el.type !== "text") {
              el.attr({
                "stroke": "#daa520",
                "stroke-width": 5,
              });
            };
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
    if ($routeParams.floorId == null) {
      //list
      var floorList = []
      for (var floorId in sampledata.floorinfo()) {
        floorList.push({id: floorId, name: sampledata.floorinfo()[floorId].name});
      };
      $scope.floorList = floorList;
    } else {
      $scope.displayed = "none";
      floorinfo = sampledata.floorinfo()[$routeParams.floorId];
      stations = floorinfo.stations;
      connections = floorinfo.connections;
      redraw();
    };
  };

});

kuihaoApp.controller('WorkCenterCtrl', function($scope, $location, $routeParams) {

  var WIDTH = 800;
  var HEIGHT = 450;

  var centerinfo = null;
  var workcenter = null;
  var mode = "normal";
  var selectedResource = null;

  $scope.save = function() {
    window.alert("Not implemented yet");
  };

  $scope.download = function() {
    window.alert("Not implemented yet");
  };

  $scope.delete = function() {
    window.alert("Not implemented yet");
  };

  var display_resource = function(resource) {
    $scope.$apply(function($scope) {
      if (resource == null) {
        $scope.resource = {};
      } else {
        $scope.resource = selectedResource;
      };
    });
  };

  var hover_in = function() {
    switch (mode) {
      case "normal":
        display_resource(this.data("product"));
        break;
      case "selected":
        break;
    };
  };

  var hover_out = function() {
    switch (mode) {
      case "normal":
        display_resource(null);
        break;
      case "selected":
        break;
    };
  };

  var click = function() {
    switch (mode) {
      case "normal":
        mode = "selected";
        selectedResource = this.data("product");
        $scope.resource = selectedResource;
        break;
      case "selected":
        if (selectedResource == this.data("product")) {
          mode = "normal";
          selectedResource = null;
          $scope.resource = {};
        };
        break;
    };
    redraw();
    $scope.$digest();
  };

  var redraw = function() {
    if (workcenter != null) {
      workcenter.clear();
    } else {
      workcenter = Raphael("workcenter", WIDTH, HEIGHT);
    }
    workcenter.rect(WIDTH/2-20, 0, 40, HEIGHT, 0)
      .attr({
        fill: "#ccccff",
        stroke: "#ccccff",
      });
    workcenter.text(400, 150, centerinfo.name)
      .attr({
        stroke: "#000000",
      })
      .transform("r-90");
    centerinfo.products.forEach(function(product, i) {
      var productShapes = [];
      switch (product.type) {
        case "modified":
          productShapes.push(
            workcenter.rect(200, 30+50*i, 100, 30)
              .attr({
                fill: "#00cc00",
                stroke: "#00cc00",
              })
          );
          productShapes.push(
            workcenter.text(250, 45+50*i, product.name)
          );
          productShapes.push(
            workcenter.rect(500, 30+50*i, 100, 30)
              .attr({
                fill: "#00cc00",
                stroke: "#00cc00",
              })
          );
          productShapes.push(
            workcenter.text(550, 45+50*i, product.name + "\n" + product.change)
          );
          workcenter.path("M" + [300,45+50*i] + "L" + [500, 45+50*i])
            .attr({
              stroke: "#888888",
            })
            .toBack();
          break;
        case "input":
          productShapes.push(
            workcenter.rect(200, 30+50*i, 100, 30)
              .attr({
                fill: "#00cc00",
                stroke: "#00cc00",
              })
          );
          productShapes.push(
            workcenter.text(250, 45+50*i, product.name)
          );
          workcenter.path("M" + [250,45+50*i] + "L" + [400, 45+50*i])
            .attr({
              stroke: "#888888",
            })
            .toBack();
          break;
        case "output":
          productShapes.push(
            workcenter.rect(500, 30+50*i, 100,30)
              .attr({
                fill: "#00cc00",
                stroke: "#00cc00",
              })
          );
          productShapes.push(
            workcenter.text(550, 45+50*i, product.name)
          );
          var l = workcenter.path("M" + [420,45+50*i] + "L" + [500, 45+50*i])
            .attr({
              stroke: "#888888",
            })
            .toBack();
          var m = l.getPointAtLength(l.getTotalLength()/2);
          var midpoint = workcenter.path("M0,-5L5,5L-5,5Z").transform("t" + [m.x,m.y] + "r90").attr({stroke: "#000000"});
          break;
      };
      productShapes.forEach(function(productShape) {
        if (mode == "selected") {
          if (selectedResource == product) {
            if (productShape.type == "rect") {
              productShape.attr({
                "stroke-width": 5,
                "stroke": "#daa520",
              });
            };
          };
        };
        productShape
          .hover(hover_in, hover_out)
          .click(click)
          .data("product", product);
      });
    });
  };

  $scope.selectedMode = function() {
    return (mode == "selected");
  };

  $scope.resetInit = function() {
    if ($routeParams.workcenterId == null) {
      //list
      var centerList = []
      for (var centerid in sampledata.workcenterinfo()) {
        centerList.push({id: centerid, name: sampledata.workcenterinfo()[centerid].name});
      };
      $scope.centerList = centerList;
    } else {
      //show
      centerinfo = sampledata.workcenterinfo()[$routeParams.workcenterId];
      $scope.name = centerinfo.name;
      $scope.resource = {};
      $scope.$watch('resource.name', function(n,o) { if (n!=o) redraw() });
      $scope.$watch('resource.type', function(n,o) { if (n!=o) redraw() });
      $scope.$watch('resource.change', function(n,o) { if (n!=o) redraw() });
      redraw();
    };
  };

  $scope.addResource = function() {
    centerinfo.products.push({
      name: "New Product",
      type: "input",
    });
    redraw();
  };

  $scope.deleteResource = function() {
    switch (mode) {
      case "selected":
        var index = centerinfo.products.indexOf(selectedResource);
        if (index > -1) {
          centerinfo.products.splice(index, 1);
        };
        mode = "normal";
        selectedResource = null;
        break;
    };
    redraw();
  };

});

