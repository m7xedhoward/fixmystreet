(function(){

if (!fixmystreet.maps) {
    return;
}


var layers = [
  {
    "categories": ["Pothole"],
    "item_name": "Road Section",
    "layer_name": "Adopted Network",
    "styleid": "5ef5c9d6e2950d005648deab",
    "layerid": "layers_gullies_5ea81c09ca315000b0da4ffa"
  }
];



var base_url = fixmystreet.staging ?
      "/resource-proxy/proxy.php/?http://layers/${layerid}/${x}/${y}/${z}/cluster" :
      "/resource-proxy/proxy.php/?http://layers/${layerid}/${x}/${y}/${z}/cluster";

var url_with_style = base_url + '?styleIds=${styleid}';


var northumberland_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
  class: OpenLayers.Layer.AlloyVectorAsset,
  protocol_class: OpenLayers.Protocol.AlloyV2,
  http_options: {
    base: url_with_style
  },
  non_interactive: false,
  body: "Northumberland County Council",
  always_visible: false,
  road: true,
  attributes: {
    asset_resource_id: "itemId"
  }
});

fixmystreet.alloy_add_layers(northumberland_defaults, layers);
fixmystreet.alloy_add_layers(northumberland_defaults, layers);
var highway_layers = [
  {
    "categories": ["Pothole"],
    "item_name": "Road Section",
    "layer_name": "Adopted Network",
    "styleid": "5ef5c9d6e2950d005648deab",
    "layerid": "layers_gullies_5ea81c09ca315000b0da4ffa"
  }
];
var highway_defaults = $.extend(true, {}, northumberland_defaults, {
  http_options: {
    base: url_with_style
  },
});
fixmystreet.alloy_add_layers(highway_defaults, highway_layers);

})();
