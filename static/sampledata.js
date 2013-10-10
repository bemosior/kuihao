var sampledata = {
  floorinfo : function() {
    return {
      "222d49c0-2ef7-11e3-aa6e-0800200c9a66": {
        id: "222d49c0-2ef7-11e3-aa6e-0800200c9a66",
        name: "Blade Build",
        flow: [
          "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a",
          "d8e5fa43-63d3-4228-9c93-ff1c64d2371b",
        ],
        stations: {
          "7a5041e6-8f92-4bf6-b962-9f75bf9c070d": {
            id: "7a5041e6-8f92-4bf6-b962-9f75bf9c070d",
            name: "Blade",
            modified: [],
            loc: [100,200],
            type: "product",
          },
          "eaef65f2-0369-4d05-ace5-123e33486373": {
            id: "eaef65f2-0369-4d05-ace5-123e33486373",
            name: "OS License",
            modified: [],
            loc: [200,100],
            type: "product",
          },
          "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a": {
            id: "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a",
            loc: [200,200],
            type: "workcenter",
          },
          "60c90afc-3ea1-405c-b3b9-abc25640e590": {
            id: "60c90afc-3ea1-405c-b3b9-abc25640e590",
            name: "Blade",
            modified: [],
            loc: [300, 200],
            type: "product",
          },
          "5088cec1-f3d3-4fc8-9014-93cdf3247672": {
            id: "5088cec1-f3d3-4fc8-9014-93cdf3247672",
            name: "Centrify License",
            modified: [],
            loc: [400, 100],
            type: "product",
          },
          "d8e5fa43-63d3-4228-9c93-ff1c64d2371b": {
            id: "d8e5fa43-63d3-4228-9c93-ff1c64d2371b",
            loc: [400,200],
            type: "workcenter",
          },
          "f65e0589-afff-4942-ba2c-4feb72334a85": {
            id: "f65e0589-afff-4942-ba2c-4feb72334a85",
            name: "Blade",
            modified: [],
            loc: [500,200],
            type: "product",
          },
        },
        connections: {
          "7a5041e6-8f92-4bf6-b962-9f75bf9c070d|4eb234b0-9ea4-45a7-82ec-3f7dd60db20a" : {
            source: "7a5041e6-8f92-4bf6-b962-9f75bf9c070d",
            destination: "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a",
          },
          "eaef65f2-0369-4d05-ace5-123e33486373|4eb234b0-9ea4-45a7-82ec-3f7dd60db20a" : {
            source: "eaef65f2-0369-4d05-ace5-123e33486373",
            destination: "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a",
          },
          "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a|60c90afc-3ea1-405c-b3b9-abc25640e590" : {
            source: "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a",
            destination: "60c90afc-3ea1-405c-b3b9-abc25640e590",
          },
        },
      },
    };
  },
  workcenterinfo : function() {
    return {
      "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a": {
        id: "4eb234b0-9ea4-45a7-82ec-3f7dd60db20a",
        name: "KVM/Remote Console",
        products: [
          {
            name: 'Blade',
            type: 'modified',
            change: '+os',
          },
          {
            name: 'OS License',
            type: 'input',
          },
        ],
      },
      "d8e5fa43-63d3-4228-9c93-ff1c64d2371b": {
        id: "d8e5fa43-63d3-4228-9c93-ff1c64d2371b",
        name: "adjoin",
        products: [
          {
            name: 'Blade',
            type: 'modified',
            change: '+adclient',
          },
          {
            name: 'Centrify License',
            type: 'input',
          },
        ],
      },
    };
  },
};
