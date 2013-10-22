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

kuihaoApp.service('WorkCenter', function() {

  this.generateId = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
  };

  this.list = function() {
    var result = [];
    var wcList = JSON.parse(localStorage.getItem('kuihao.wclist'));
    if (wcList == null) return [];
    wcList.forEach(function(id) {
      var wc = JSON.parse(localStorage.getItem('kuihao.wc.' + id));
      result.push({
        id: wc.id,
        name: wc.name,
      });
    });
    return result;
  };

  this.fetch = function(id) {
    var res = JSON.parse(localStorage.getItem('kuihao.wc.' + id));
    if (res.products == null) {
      res.products = [];
    };
    if (res.steps == null) {
      res.steps = [];
    };
    return res;
  };

  this.add = function(wc) {
    var wcString = JSON.stringify(wc);
    var wcList = JSON.parse(localStorage.getItem('kuihao.wclist'));
    if (wcList == null) wcList = [];
    wcList.push(wc.id);
    var wcListString = JSON.stringify(wcList);
    localStorage.setItem('kuihao.wc.' + wc.id, wcString);
    localStorage.setItem('kuihao.wclist', wcListString);
  };

  this.update = function(wc) {
    localStorage.setItem('kuihao.wc.' + wc.id, JSON.stringify(wc));
    return wc;
  };

  this.remove = function(id) {
    var wcList = JSON.parse(localStorage.getItem('kuihao.wclist'));
    if (wcList == null) return;
    var idx = wcList.indexOf(id);
    if (idx>=0) {
      wcList.splice(idx,1);
      localStorage.removeItem('kuihao.wc.' + id);
      localStorage.setItem('kuihao.wclist', JSON.stringify(wcList));
    };
  };

});

kuihaoApp.service('Floor', function() {

  this.generateId = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
  };

  this.list = function() {
    var result = [];
    var floorList = JSON.parse(localStorage.getItem('kuihao.floorlist'));
    if (floorList == null) return [];
    floorList.forEach(function(id) {
      var floor = JSON.parse(localStorage.getItem('kuihao.floor.' + id));
      result.push({
        id: floor.id,
        name: floor.name,
      });
    });
    return result;
  };

  this.fetch = function(id) {
    return JSON.parse(localStorage.getItem('kuihao.floor.' + id));
  };

  this.add = function(floor) {
    var floorString = JSON.stringify(floor);
    var floorList = JSON.parse(localStorage.getItem('kuihao.floorlist'));
    if (floorList == null) floorList = [];
    floorList.push(floor.id);
    var floorList = JSON.stringify(floorList);
    localStorage.setItem('kuihao.floor.' + floor.id, floorString);
    localStorage.setItem('kuihao.floorlist', floorList);
  };

  this.update = function(floor) {
    localStorage.setItem('kuihao.floor.' + floor.id, JSON.stringify(floor));
    return floor;
  };

  this.remove = function(id) {
    var floorList = JSON.parse(localStorage.getItem('kuihao.floorlist'));
    if (floorList == null) return;
    var idx = floorList.indexOf(id);
    if (idx>=0) {
      floorList.splice(idx,1);
      localStorage.removeItem('kuihao.floor.' + id);
      localStorage.setItem('kuihao.floorlist', JSON.stringify(floorList));
    };
  };

});

kuihaoApp.service('Run', function(Floor, WorkCenter) {

  this.generateId = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
  };

  this.list = function() {
    var result = [];
    var runList = JSON.parse(localStorage.getItem('kuihao.runlist'));
    if (runList == null) return [];
    runList.forEach(function(id) {
      var run = JSON.parse(localStorage.getItem('kuihao.run.' + id));
      result.push({
        id: run.id,
        floorname: run.floorname,
        starttime: (new Date(run.starttime)).toString(),
      });
    });
    return result;
  };

  this.create = function(floorId) {
    var run = {
      id: this.generateId(),
      floorId: floorId,
      flow: [],
      starttime: (new Date()).getTime(),
    };
    var wf = Floor.fetch(floorId);
    run.floorname = wf.name;
    var wcCount = 0;
    wf.flow.forEach(function(stationId) {
      var wc = WorkCenter.fetch(stationId);
      if (wc.steps.length == 0) {
        run.flow.push({
          wc: wcCount,
          text: wc.name,
        });
      } else {
        wc.steps.forEach(function(step) {
          run.flow.push({
            wc: wcCount,
            text: step.text,
          });
        });
      };
      wcCount += 1;
    });
    var runList = JSON.parse(localStorage.getItem('kuihao.runlist'));
    if (runList == null) runList = [];
    runList.push(run.id);
    localStorage.setItem('kuihao.run.' + run.id, JSON.stringify(run));
    localStorage.setItem('kuihao.runlist', JSON.stringify(runList));
    return run.id;
  };

  this.fetch = function(id) {
    return JSON.parse(localStorage.getItem('kuihao.run.' + id));
  };

  this.update = function(run) {
    localStorage.setItem('kuihao.run.' + run.id, JSON.stringify(run));
    return run;
  };

  this.remove = function(id) {
    var runList = JSON.parse(localStorage.getItem('kuihao.runlist'));
    if (runList == null) return;
    var idx = runList.indexOf(id);
    if (idx>=0) {
      runList.splice(idx,1);
      localStorage.removeItem('kuihao.run.' + id);
      localStorage.setItem('kuihao.runlist', JSON.stringify(runList));
    };
  };

});

kuihaoApp.controller('PickCtrl', function($scope) {
})
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/floor', {templateUrl: 'partials/floor-list.html', controller: 'MainCtrl'})
      .when('/floor/:floorId', {templateUrl: 'partials/floor-show.html', controller: 'MainCtrl'})
      .when('/workcenter', {templateUrl: 'partials/workcenter-list.html', controller: 'WorkCenterCtrl'})
      .when('/workcenter/:workcenterId', {templateUrl: 'partials/workcenter-show.html', controller: 'WorkCenterCtrl'})
      .when('/run', {templateUrl: 'partials/run-list.html', controller: 'RunCtrl'})
      .when('/run/:runId', {templateUrl: 'partials/run-show.html', controller: 'RunCtrl'})
      .otherwise({redirectTo: '/floor'})
    ;
  }]);

kuihaoApp.controller('MainCtrl', function($scope, $routeParams, $location, $route, WorkCenter, Floor, Run) {

  var WIDTH = 800;
  var HEIGHT = 450;
  var WORKCENTER = {
    height: 60,
    width: 60,
  };
  var PRODUCT = {
    height: 60,
    width: 60,
  };

  var stations = null;
  var connections = null;

  var stationShapes = [];
  var connectionShapes = {};

  var mode = "show";
  var selectedStation = null;

  $scope.loadSampleData = function() {
    var sample = sampledata.floorinfo();
    for (var floorId in sample) {
      if (Floor.fetch(floorId) == null) {
        Floor.add(sample[floorId]);
      };
    };
    $route.reload();
  };

  $scope.newWorkFloor = function() {
    var wf = {
      id: Floor.generateId(),
      name: "unnamed",
      flow: [],
      stations: {},
      connections: {},
    };
    Floor.add(wf);
    $location.path("/floor/" + wf.id);
  };

  $scope.save = function() {
    var wf = {
      id: floorinfo.id,
      name: floorinfo.name,
      stations: {},
      connections: floorinfo.connections,
      flow: floorinfo.flow,
    };
    for (var stationId in floorinfo.stations) {
      wf.stations[stationId] = {
        id: floorinfo.stations[stationId].id,
        loc: floorinfo.stations[stationId].loc,
        type: floorinfo.stations[stationId].type,
      };
      if (floorinfo.stations[stationId].type == "product") {
        wf.stations[stationId].name = floorinfo.stations[stationId].name;
        wf.stations[stationId].modified = floorinfo.stations[stationId].modified;
      };
    }
    Floor.update(wf);
    window.alert("Saved!");
  };

  $scope.download = function() {
    window.alert("Not implemented yet");
  };

  $scope.delete = function() {
    if (window.confirm("Delete \"" + floorinfo.name + "\"?")) {
      Floor.remove(floorinfo.id);
      $location.path("/floor");
    };
  };

  var drag_move = function (dx, dy) {
    if (mode != "move") return;
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
    if (mode != "move") return;
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

  var display_selectedStation = function() {
    $scope.$apply(function($scope) {
      $scope.station = selectedStation;
    });
  };

  var display_clear = function() {
    $scope.$apply(function($scope) {
      $scope.displayed = "none";
      $scope.station   = null;
    });
  };

  var hover_in = function() {
    switch (mode) {
      case "show":
      case "move":
      case "connect":
      case "path":
      case "delete":
        display_station(this);
        break;
    };
  };

  var hover_out = function() {
    switch (mode) {
      case "show":
      case "move":
      case "delete":
        display_clear();
        break;
      case "connect":
      case "path":
        if (selectedStation != null) {
          display_selectedStation();
        } else {
          display_clear();
        };
        break;
    };
  };

  var click = function() {
    switch (mode) {
      case "show":
      case "move":
        break;
      case "connect":
        if (selectedStation != null) {
          if (this.data("station") == selectedStation) {
            selectedStation = null;
            redraw();
            return;
          };
          if (this.data("station").type == selectedStation.type) return;
          var source = selectedStation;
          var destination = this.data("station");
          if (connections[source.id + "|" + destination.id] !== undefined) return;
          if (connections[destination.id + "|" + source.id] !== undefined) return;
          connections[source.id + "|" + destination.id] = {
            source: source.id,
            destination: destination.id,
          };
          calculate_flow();
          redraw();
        } else {
          selectedStation = this.data("station")
          redraw();
        };
        break;
      case "path":
        // three cases:
        if (this.data("station").type == "workcenter") {
          if (floorinfo.flow.indexOf(this.data("station").id) == -1) {
            // 1.) this isn't in the path at all, so add it
            floorinfo.flow.push(this.data("station").id);
            var station = this.data("station");
            var pathShape = floorDiagram.text(station.loc[0], station.loc[1]-20, floorinfo.flow.length)
              .attr({
                "stroke": "#0000ff",
                "font-size": "20",
                "cursor": cursor(),
              })
              .data("station", station)
              .click(click);
            pathShapes.push(pathShape);
          } else if (floorinfo.flow.indexOf(this.data("station").id) == floorinfo.flow.length-1) {
            // 2.) this is the last one in the path, so remove it
            if (floorinfo.flow.length > 0) {
              pathShapes.pop().remove();
              floorinfo.flow.pop();
            };
          } else {
            // 3.) this isn't the last one in the path, so leave it and alert
            window.alert("Must choose last of the path");
          };
        };
        break;
      case "delete":
        var station = this.data("station");
        if (window.confirm("Delete \"" + station.name + "\"?")) {
          // remove the selected station
          delete stations[station.id];
          // clean up any lingering connections
          var cleanup = []
          for (connectionId in connections) {
            if (connections[connectionId].source == station.id || connections[connectionId].destination == station.id) {
              cleanup.push(connectionId);
            };
          };
          cleanup.forEach(function(connectionId) {
            delete connections[connectionId];
          });
          // update product list to pick from (in case this was a workcenter)
          update_productList();
          // reset mode, clear selection
          $scope.displayed = "none";
          // redraw
          redraw();
        };
        break;
    }
  };

  var clickConnection = function() {
    if (mode == "connect") {
      var connection = this.data("connection");
      delete connections[connection.source + "|" + connection.destination];
      this.remove();
      redraw();
    };
  };

  var floorDiagram;
  var workCenters, workCenterShapes;
  var products, productShapes;
  var connections, connectionShapes, arrows;
  var pathShapes;
  var floor;

  var state = "normal";

  var unfulfilledColor = "#CC0033";
  var fulfilledColor   = "#00CC33";

  $scope.addWorkCenter = function() {
    var newWorkcenterId = $scope.addWorkCenterSelection;
    if (stations[newWorkcenterId] != null) {
      window.alert("Already exists");
      return;
    };
    stations[newWorkcenterId] = WorkCenter.fetch(newWorkcenterId);
    stations[newWorkcenterId].loc = [WIDTH/2, HEIGHT/2];
    stations[newWorkcenterId].type = "workcenter";
    update_productList();
    redraw();
  };

  $scope.addProduct = function() {
    var uuid = generateUUID();
    var product = {
      id: uuid,
      name: $scope.addProductionSelection,
      loc: [WIDTH/2, HEIGHT/2],
      type: "product",
      modified: [],
    };
    stations[uuid] = product;
    redraw();
  };

  var station_fulfilled = function(stationId) {
    var res = false;
    var station = stations[stationId];
    switch (station.type) {
      case "product":
        res = false;
        // If any of this product's sources is a workcenter
        // which has this product as an output(or modified),
        // then we're good
        for (var connectionId in connections) {
          if (connections[connectionId].destination == stationId) {
            var wc = WorkCenter.fetch(connections[connectionId].source);
            wc.products.forEach(function(product) {
              if ((product.type == "output" || product.type == "modified") && 
                  (product.name == station.name)) res = true;
            });
          };
        };
        break;
      case "workcenter":
        res = true;
        // All of the inputs for this workcenter need to be
        // satisfied
        var wcRequiredInputs = [];
        WorkCenter.fetch(station.id).products.forEach(function(product) {
          if (product.type == "input" || product.type == "modified") wcRequiredInputs.push(product.name);
        });
        var wcActualInputs   = [];
        for (var connectionId in connections) {
          if (connections[connectionId].destination == stationId) {
            wcActualInputs.push(stations[connections[connectionId].source].name);
          };
        };
        wcRequiredInputs.forEach(function (req) {
          if (wcActualInputs.indexOf(req) == -1) res = false;
        });
        break;
    };
    return res;
  };

  var cursor = function() {
    switch (mode) {
      case "show":
        return "default";
      case "move":
        return "move";
      case "connect":
        return "crosshair";
      case "path":
        return "crosshair";
      case "delete":
        return "not-allowed";
      default:
        return "default";
    };
  };

  var updateCursor = function() {
    stationShapes.forEach(function(set) {
      set.attr({"cursor": cursor()});
    });
  }

  var leaveMode = {
    "show": function() {
    },
    "move": function() {
    },
    "connect": function() {
      selectedStation = null;
    },
    "path": function() {
      pathShapes.forEach(function(pathShape) {
        pathShape.remove();
      });
      pathShapes = null;
    },
    "delete": function() {
    },
  };

  $scope.showMode = function() {
    leaveMode[mode]();
    mode = "show";
    updateCursor();
  };

  $scope.moveMode = function() {
    if (mode == "move") {
      $scope.showMode();
      return;
    };
    leaveMode[mode]();
    mode = "move";
    updateCursor();
  };

  $scope.connectMode = function() {
    if (mode == "connect") {
      $scope.showMode();
      return;
    };
    leaveMode[mode]();
    mode = "connect";
    updateCursor();
  };

  $scope.pathMode = function() {
    if (mode == "path") {
      $scope.showMode();
      return;
    };
    leaveMode[mode]();
    mode = "path";
    pathShapes = [];
    var idx = 1;
    floorinfo.flow.forEach(function(stationId) {
      var station = stations[stationId];
      var pathShape = floorDiagram.text(station.loc[0], station.loc[1]-20, idx)
        .attr({
          "stroke": "#0000ff",
          "font-size": "20",
          "cursor": cursor(),
        })
        .data("station", station)
        .click(click);
      pathShapes.push(pathShape);
      idx += 1;
    });
    updateCursor();
  };

  $scope.deleteMode = function() {
    if (mode == "delete") {
      $scope.showMode();
      return;
    };
    leaveMode[mode]();
    mode = "delete";
    updateCursor();
  };

  $scope.classMode = function(checkName) {
    if (mode == checkName) {
      return "btn-success";
    } else {
      return "btn-primary";
    };
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
              fill: station_fulfilled(stationId) ? fulfilledColor : unfulfilledColor,
              stroke: station_fulfilled(stationId) ? fulfilledColor : unfulfilledColor,
              "fill-opacity": 1,
              "stroke-width": 2,
            });
          var productlabel = station.name;
          if (station.modified != 0) {
            productlabel += "\n" + station.modified.join(",");
          };
          var label = floorDiagram.text(station.loc[0], station.loc[1], productlabel);
          set
            .push(circle, label)
            .attr({cursor: cursor()})
            .data("set", set)
            .data("station", station)
            .hover(hover_in, hover_out)
            .drag(drag_move, drag_start)
            .click(click);
          stationShapes.push(set);
          station.shape = set;
          break;
        case "workcenter":
          var set = floorDiagram.set();
          var rect = floorDiagram.rect(station.loc[0]-WORKCENTER.width/2, station.loc[1]-WORKCENTER.height/2, WORKCENTER.width, WORKCENTER.height, 5)
            .attr({
              fill: station_fulfilled(stationId) ? fulfilledColor : unfulfilledColor,
              stroke: station_fulfilled(stationId) ? fulfilledColor : unfulfilledColor,
              "fill-opacity": 1,
              "stroke-width": 2,
            });
          var label = floorDiagram.text(station.loc[0], station.loc[1], WorkCenter.fetch(station.id).name);
          set
            .push(rect, label)
            .attr({cursor: cursor()})
            .data("set", set)
            .data("station", station)
            .hover(hover_in, hover_out)
            .drag(drag_move, drag_start)
            .click(click);
          stationShapes.push(set);
          station.shape = set;
          break;
        default:
          break;
      };
    };
    if (selectedStation != null) {
      selectedStation.shape.forEach(function (el) {
        if (el.type !== "text") {
          el.attr({
            "stroke": "#daa520",
              "stroke-width": 5,
          });
        };
      });
    };
    connectionShapes = [];
    arrows = {};
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
              "cursor": "not-allowed",
            })
            .click(clickConnection)
            .data("connection", connection)
        );
        var lastShape = connectionShapes[connectionShapes.length-1];
        var point = lastShape.getPointAtLength(lastShape.getTotalLength()/2);
        var rotation = 0;
        if (destination[0] == source[0]) {
          if (destination[1] < source[1]) {
            rotation = 0;
          } else {
            rotation = 180;
          }
        } else if (destination[0] < source[0]) {
          rotation = Math.round(Math.atan( (destination[1]-source[1])/(destination[0]-source[0]) )*180/Math.PI)-90;
        } else {
          rotation = Math.round(Math.atan( (destination[1]-source[1])/(destination[0]-source[0]) )*180/Math.PI)+90;
        };
        arrows[connectionId] = floorDiagram.path("M0,-5L5,5L-5,5Z")
          .transform("t" + [point.x,point.y] + "r" + rotation)
          .attr({
            stroke: "#000000",
            fill: "#000000",
            cursor: "not-allowed"
          })
          .click(clickConnection)
          .data("connection", connection);
      };
    };
    //setupMode();
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
        arrow = arrows[connection.source + "|" + connection.destination];
        var point = connectionShape.getPointAtLength(connectionShape.getTotalLength()/2);
        // 0 = pointing straight up. go clockwise to 359
        var rotation = 0;
        if (destination[0] == source[0]) {
          if (destination[1] < source[1]) {
            // destination is above source in the diagram
            rotation = 0;
          } else {
            // destionation is below source in the diagram
            rotation = 180;
          }
        } else if (destination[0] < source[0]) {
          rotation = Math.round(Math.atan( (destination[1]-source[1])/(destination[0]-source[0]) )*180/Math.PI)-90;
        } else {
          rotation = Math.round(Math.atan( (destination[1]-source[1])/(destination[0]-source[0]) )*180/Math.PI)+90;
        };
        arrow.transform("t" + [point.x,point.y] + "r" + rotation);
      };
    };
  };

  var update_productList = function() {
    var productList = [];
    for (var stationId in stations) {
      if (stations[stationId].type == "workcenter") {
        WorkCenter.fetch(stationId).products.forEach(function(product) {
          if (productList.indexOf(product.name) == -1) {
            productList.push(product.name);
          };
        });
      };
    };
    $scope.productList = productList.sort();
  };

  var calculate_flow = function() {
    floorinfo.flow.forEach(function(workcenterId) {
      var inputs = [];
      var inputNames = [];
      var outputs = [];
      var outputNames = [];
      var workcenter = WorkCenter.fetch(workcenterId);
      for (var connectionId in connections) {
        var connection = connections[connectionId];
        if (workcenterId == connection.destination) {
          inputs.push(stations[connection.source]);
          inputNames.push(stations[connection.source].name);
        } else
        if (workcenterId == connection.source) {
          outputs.push(stations[connection.destination]);
          outputNames.push(stations[connection.destination].name);
        };
      };
      workcenter.products.forEach(function(product) {
        if (product.type == "modified") {
          var inputIdx = inputNames.indexOf(product.name);
          var outputIdx = outputNames.indexOf(product.name);
          if (inputIdx > -1 && outputIdx > -1) {
            outputs[outputIdx].modified = inputs[outputIdx].modified.concat(product.change.replace("+",""));
          };
        };
      });
    });
  };

  $scope.resetInit = function() {
    if ($routeParams.floorId == null) {
      //list
      var floorList = []
      floorList = Floor.list();
      $scope.floorList = floorList;
    } else {
      $scope.displayed = "none";
      floorinfo = Floor.fetch($routeParams.floorId);
      stations = floorinfo.stations;
      connections = floorinfo.connections;
      $scope.name = floorinfo.name;
      $scope.$watch('name', function(n,o) { if (n!=o) { floorinfo.name=$scope.name; redraw() }; });
      $scope.centerList = WorkCenter.list();;
      update_productList();
      calculate_flow();
      redraw();
    };
  };

  $scope.runMe = function() {
    var run = Run.create(floorinfo.id);
    $location.path('/run/' + run);
  };

});

kuihaoApp.controller('WorkCenterCtrl', function($scope, $location, $routeParams, $route, WorkCenter) {

  var WIDTH = 800;

  var centerinfo = null;
  var workcenter = null;
  var mode = "normal";
  var selectedResource = null;

  $scope.loadSampleData = function() {
    var sample = sampledata.workcenterinfo();
    for (var centerId in sample) {
      if (WorkCenter.fetch(centerId) == null) {
        WorkCenter.add(sample[centerId]);
      };
    };
    $route.reload();
  };

  $scope.newWorkCenter = function() {
    var wc = {
      id: WorkCenter.generateId(),
      name: "unnamed",
      products: [],
    };
    WorkCenter.add(wc);
    $location.path("/workcenter/" + wc.id);
  };

  $scope.save = function() {
    // make sure steps are fixed up since they aren't $watched
    var steps = [];
    $scope.steps.forEach(function(step) {
      steps.push({text: step.text, full: step.full});
    });
    centerinfo.steps = steps;
    WorkCenter.update(centerinfo);
    window.alert("Saved!");
  };

  $scope.download = function() {
    window.alert("Not implemented yet");
  };

  $scope.delete = function() {
    if (window.confirm("Delete \"" + centerinfo.name + "\"?")) {
      WorkCenter.remove(centerinfo.id);
      $location.path("/workcenter");
    };
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
        } else {
          selectedResource = this.data("product");
          $scope.resource = selectedResource;
        };
        break;
    };
    redraw();
    $scope.$digest();
  };

  var redraw = function() {
    var height = 30+50*centerinfo.products.length;
    if (workcenter != null) {
      workcenter.clear();
      workcenter.setSize(WIDTH, height);
    } else {
      workcenter = Raphael("workcenter", WIDTH, height);
    }
    workcenter.rect(WIDTH/2-20, 0, 40, height, 0)
      .attr({
        fill: "#ccccff",
        stroke: "#ccccff",
      });
    workcenter.text(400, height/2, centerinfo.name)
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
          var l = workcenter.path("M" + [300,45+50*i] + "L" + [500, 45+50*i])
            .attr({
              stroke: "#888888",
            })
            .toBack();
          var m = l.getPointAtLength(l.getTotalLength()/4);
          var qtrpoint = workcenter.path("M0,-5L5,5L-5,5Z").transform("t" + [m.x,m.y] + "r90").attr({stroke: "#000000", fill: "#000000"});
          var n = l.getPointAtLength(l.getTotalLength()/4*3);
          var threeqtrpoint = workcenter.path("M0,-5L5,5L-5,5Z").transform("t" + [n.x,n.y] + "r90").attr({stroke: "#000000", fill: "#000000"});
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
          var l = workcenter.path("M" + [250,45+50*i] + "L" + [400, 45+50*i])
            .attr({
              stroke: "#888888",
            })
            .toBack();
          var m = l.getPointAtLength(l.getTotalLength()/2);
          var midpoint = workcenter.path("M0,-5L5,5L-5,5Z").transform("t" + [m.x,m.y] + "r90").attr({stroke: "#000000", fill: "#000000"});
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
          var midpoint = workcenter.path("M0,-5L5,5L-5,5Z").transform("t" + [m.x,m.y] + "r90").attr({stroke: "#000000", fill: "#000000"});
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

  var setSteps = function() {
    var steps = [];
    centerinfo.steps.forEach(function(step) {
      steps.push({text: step.text, full: step.full});
    });
    $scope.steps = steps;
  };

  $scope.resetInit = function() {
    if ($routeParams.workcenterId == null) {
      //list
      var centerList = []
      centerList = WorkCenter.list();
      $scope.centerList = centerList;
    } else {
      //show
      centerinfo = WorkCenter.fetch($routeParams.workcenterId);
      $scope.name = centerinfo.name;
      $scope.$watch('name', function(n,o) { if (n!=o) { centerinfo.name=$scope.name; redraw() }; });
      $scope.resource = {};
      $scope.$watch('resource.name', function(n,o) { if (n!=o) redraw() });
      $scope.$watch('resource.type', function(n,o) { if (n!=o) redraw() });
      $scope.$watch('resource.change', function(n,o) { if (n!=o) redraw() });
      setSteps();
      $scope.newStep = {text: "", full: ""};
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

  $scope.addStep = function() {
    if (!$scope.newStep.text.length && !$scope.newStep.full.length) {
      window.alert("New steps must not be blank.");
      return;
    };
    $scope.steps.push({
      text: $scope.newStep.text,
      full: $scope.newStep.full
    });
    $scope.newStep = {text: "", full: ""};
    // It'd be nice to change the focus to go back to the newStep's Short
    // Description.
  };

  $scope.deleteStep = function(idx) {
    centerinfo.steps.splice(idx,1);
    setSteps();
  };

  $scope.moveUp = function(idx) {
    var movingStep = centerinfo.steps.splice(idx,1)[0];
    centerinfo.steps.splice(idx-1,0,movingStep);
    setSteps();
  };

  $scope.moveDown = function(idx) {
    var movingStep = centerinfo.steps.splice(idx,1)[0];
    centerinfo.steps.splice(idx+1,0,movingStep);
    setSteps();
  };

});

kuihaoApp.controller('RunCtrl', function($scope, $routeParams, $location, Run) {

  var runinfo = null;

  $scope.save = function() {
    // make sure steps are fixed since they also have angular markup on them
    var run = {
      id: runinfo.id,
      floorId: runinfo.floorId,
      floorname: runinfo.floorname,
      flow: [],
      starttime: runinfo.starttime,
    };
    runinfo.flow.forEach(function(step) {
      run.flow.push({
        text: step.text,
        doneP: step.doneP ? true : false,
      });
    });
    Run.update(run);
    window.alert("Saved!");
  };

  $scope.download = function() {
    window.alert("Not implemented yet");
  };

  $scope.delete = function() {
    if (window.confirm("Delete \"" + runinfo.name + "\"?")) {
      Run.remove(runinfo.id);
      $location.path("/run");
    };
  };

  $scope.downloadSummary = function() {
    window.alert("Not implemented yet");
  };

  $scope.markDone = function() {
    runinfo.flow[$scope.currentStep].doneP = true;
    $scope.currentStep += 1;
  };

  $scope.unmarkDone = function() {
    runinfo.flow[$scope.currentStep-1].doneP = false;
    $scope.currentStep -= 1;
  };

  $scope.strikeStyle = function(doneP) {
    return doneP ? {"text-decoration": "line-through"} : {};
  };

  $scope.resetInit = function() {
    if ($routeParams.runId == null) {
      var runList = Run.list();
      $scope.runList = runList;
    } else {
      runinfo = Run.fetch($routeParams.runId);
      $scope.runinfo = runinfo;
      $scope.floorname = runinfo.floorname + "(" + (new Date(runinfo.starttime)).toString() + ")";
      var currentStep = 0;
      $scope.runinfo.flow.forEach(function(step) {
        if (step.doneP) {
          currentStep += 1;
        };
      });
      $scope.currentStep = currentStep;
    };
  };

});
