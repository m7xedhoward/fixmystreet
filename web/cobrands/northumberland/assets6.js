(function(){

if (!fixmystreet.maps) {
    return;
}

var highways_style = new OpenLayers.Style({
    fill: false,
    strokeColor: "#5555FF",
    strokeOpacity: 0.1,
    strokeWidth: 7
});

var layers = [
  {
   "categories": ["Highways", "Pothole", "Flooding"],
    "item_name": "adoptednetwork",
    "layer_name": "Adopted Network",
    "styleid": "60ae2e677e3bbd02324cb8c7",
    "layerid": "layers_adoptedNetwork_5ef4add3457bbc00569b52a0",
    asset_type: 'road',
  asset_item: 'road',
  road : true,
  always_visible: true,
  stylemap: new OpenLayers.StyleMap({
        'default': highways_style
    }),
   }];
  
  var northumberland_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
  class: OpenLayers.Layer.NCCVectorAsset,
  protocol_class: OpenLayers.Protocol.AlloyV2,
  
  http_options: {
    base: "/resource-proxy/proxy.php?http://layers/${layerid}/${x}/${y}/${z}/cluster?styleIds=${styleid}"
  },
  non_interactive: false,
  body: "Northumberland County Council",
  attributes: {
    asset_resource_id: function() {
      return this.fid;
    }
  }
});

fixmystreet.alloy_add_layers(northumberland_defaults, layers);

})();
