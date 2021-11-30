(function(){

if (!fixmystreet.maps) {
    return;
}

var base_url = fixmystreet.staging ?
      "/resource-proxy/proxy.php/?http://layers/${layerid}/${x}/${y}/${z}/cluster" :
      "/resource-proxy/proxy.php/?http://layers/${layerid}/${x}/${y}/${z}/cluster";

var url_with_style = base_url + '?styleIds=${styleid}';

var layers = [

  {
    "categories": ["Pothole", "Flooding"],
    "item_name": "Road Section",
    "layer_name": "Adopted Network",
    //"styleid": "60ae2e677e3bbd02324cb8c7",
    //"layerid": "layers_adoptedNetwork_5ef4add3457bbc00569b52a0",
  },
];


var highway_layer = 'layers_adoptedNetwork_5ef4add3457bbc00569b52a0';



//This is required so that the found/not found actions are fired on category
// select and pin move rather than just on asset select/not select.
OpenLayers.Layer.NCCVectorAsset = OpenLayers.Class(OpenLayers.Layer.VectorAsset, {
    initialize: function(name, options) {
        OpenLayers.Layer.VectorAsset.prototype.initialize.apply(this, arguments);
        $(fixmystreet).on('maps:update_pin', this.checkSelected.bind(this));
        $(fixmystreet).on('report_new:category_change', this.checkSelected.bind(this));
    },

    CLASS_NAME: 'OpenLayers.Layer.NCCVectorAsset'
});

OpenLayers.Layer.NCCVectorNearest = OpenLayers.Class(OpenLayers.Layer.VectorNearest, {
    feature_table: {},
    initialize: function(name, options) {
        OpenLayers.Layer.VectorNearest.prototype.initialize.apply(this, arguments);
        this.events.register('beforefeatureadded', this, this.checkCanAddFeature);
    },

    destroyFeatures: function(features, options) {
        OpenLayers.Layer.VectorNearest.prototype.destroyFeatures.apply(this, arguments);
        this.feature_table = {};
    },

    checkCanAddFeature: function(obj) {
      if (this.feature_table[obj.feature.fid]) {
        return false;
      }

      this.feature_table[obj.feature.fid] = 1;
    },

    CLASS_NAME: 'OpenLayers.Layer.NCCVectorNearest'
});


// default options for northumberland assets include
// a) checking for multiple assets in same location
// b) preventing submission unless an asset is selected
var northumberland_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
  class: OpenLayers.Layer.NCCVectorAsset,
  protocol_class: OpenLayers.Protocol.AlloyV2,
  http_options: {
      base: url_with_style,
      layerid: highway_layer
  },
  non_interactive: false,
  body: "Northumberland Highways",
  attributes: {
    asset_resource_id: "itemId"
  },
  select_action: true,
  actions: {
    asset_found: function(asset) {
      if (fixmystreet.message_controller.asset_found.call(this)) {
          return;
      }
    },
    asset_not_found: function() {
      fixmystreet.message_controller.asset_not_found.call(this);
    }
  }
});

fixmystreet.alloy_add_layers(northumberland_defaults, layers);





// NCC roads layers which prevent report submission unless we have selected
// an asset.
var northumberland_road_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
    protocol_class: OpenLayers.Protocol.AlloyV2,
    http_options: {
        base: url_with_style,
        layerid: highway_layer
    },
    body: "Northumberland",
    road: true,
    always_visible: true,
    non_interactive: false,
    no_asset_msg_id: '#js-not-a-road',
    //usrn: {
    //    field: 'asset_resource_id'
    //},
    getUSRN: function(feature) {
      return feature.fid;
    },
    actions: {
        found: fixmystreet.message_controller.road_found,
        not_found: fixmystreet.message_controller.road_not_found
    }
});


var highways_style = new OpenLayers.Style({
    fill: true,
    strokeColor: "#32a852",
    strokeOpacity: 1,
    strokeWidth: 7
});

fixmystreet.assets.add(northumberland_road_defaults, {
    protocol_class: OpenLayers.Protocol.AlloyV2,
    // Carriageways
    http_options: {
      styleid: "5ef5c9d6e2950d005648deab",
    },
    stylemap: new OpenLayers.StyleMap({
        'default': highways_style
    }),
    asset_category: [
    	"Pothole",
        "Blocked Ditch",
        "Blocked Ditch Causing Flooding",
        "Obstruction (Not Vegetation)",
        "Pothole / Failed Reinstatement",
        "Slabs - Uneven / Damaged / Cracked",
        "Slabs - Missing",
        "Damaged/Loose",
        "Missing",
        "Crash Barriers - Damaged / Missing",
        "Road Markings - Worn/Faded",
        "Flooding",
        "Mud on Road",
        "Potholes / Highway Condition",
        "Spill - Oil/Diesel",
        "Damaged/Missing",
        "Weeds",
        "Verges - Damaged by Vehicles",
        "Icy Footpath",
        "Icy Road",
        "Missed published Gritted Route",
        "Fallen Tree",
        "Restricted Visibility / Overgrown / Overhanging",
        "Restricted Visibility"
    ]
});


fixmystreet.message_controller.add_ignored_body(northumberland_defaults.body);

})();
