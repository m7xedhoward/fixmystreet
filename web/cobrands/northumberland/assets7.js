(function(){

if (!fixmystreet.maps) {
    return;
}

/** These layers are from the Hackney WFS feed, for non-Alloy categories: 


var wfs_defaults = {
  http_options: {
    url: "/geoserver/map/ows",
    params: {
        SERVICE: "WFS",
        VERSION: "1.0.0",
        REQUEST: "GetFeature",
        SRSNAME: "urn:ogc:def:crs:EPSG::27700"
    }
},
  asset_type: 'road', 
  max_resolution: 2.388657133579254,
  asset_id_field: 'section_co',
  attributes: {Name : 'section_na'},
  geometryName: 'geom',
  srsName: "EPSG:27700",
  strategy_class: OpenLayers.Strategy.FixMyStreet,
  body: "Northumberland County Council",
  asset_item: "item"
};
*/
var wfs_spot = {
  http_options: {
    url: "/geoserver/map/ows",
    params: {
        SERVICE: "WFS",
        VERSION: "1.0.0",
        REQUEST: "GetFeature",
        SRSNAME: "urn:ogc:def:crs:EPSG::27700"
    }
},
  asset_type: 'spot', 
  max_resolution: 2.388657133579254,
  asset_id_field: 'unitno',
  attributes: {},
  geometryName: 'geom',
  srsName: "EPSG:27700",
  strategy_class: OpenLayers.Strategy.FixMyStreet,
  body: "Northumberland County Council",
  asset_item: "item"
};



fixmystreet.assets.add(wfs_spot, {
  http_options: {
      params: {
            TYPENAME: "map:street_lighting"
      }
  },
    asset_category: ["Street Lighting Issue"],
  attributes: {}
});



/**

OpenLayers.Layer.VectorAssetNorthumberland= OpenLayers.Class(OpenLayers.Layer.VectorAsset, {
    relevant: function() {
        var relevant = OpenLayers.Layer.VectorAsset.prototype.relevant.apply(this, arguments),
            subcategories = this.fixmystreet.subcategories,
            subcategory = $('#form_service_sub_code').val(),
            relevant_sub = OpenLayers.Util.indexOf(subcategories, subcategory) > -1;
        return relevant && relevant_sub;
    },

    CLASS_NAME: 'OpenLayers.Layer.VectorAssetNorthumberland'
});


$(function(){
    $("#problem_form").on("change.category", "#form_service_sub_code", function() {
        $(fixmystreet).trigger('report_new:category_change');
    });
});
 
fixmystreet.assets.add(wfs_spot, {
    class: OpenLayers.Layer.VectorAssetNorthumberland,
    http_options: {
        params: {
            TYPENAME: "map:street_lighting"
        }
    },
    asset_id_field: 'unitno',
    attributes: {
        feature_id: 'unitno'
    },
    asset_category: ["Broken"],
    asset_item: 'item'
});



fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "map:adopted_network",
      }
  },
  asset_category: "Highways",
  attributes: {}
});

fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "map:landownership",
      }
  },
  asset_category: ["Footways"],
  attributes: {}
});

fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "parking:pay_display_machine_liberator",
      }
  },
  asset_category: "Pay & Display Machines",
  attributes: {}
});

fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "recycling:estate_recycling_bin",
      }
  },
  asset_category: "Bin Contamination",
  attributes: {}
});

fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "amenity:sport_facility",
      }
  },
  asset_category: "Sport Area",
  attributes: {}
});

fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "greenspaces:park_bench",
      }
  },
  asset_category: "Park Furniture (bench)",
  attributes: {}
});

fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "greenspaces:park_bin",
      }
  },
  asset_category: "Park Furniture (bin)",
  attributes: {}
});

fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "greenspaces:park_picnic_bench",
      }
  },
  asset_category: "Park Furniture (picnic bench)",
  attributes: {}
});

fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "transport:bike_hangar_scheme",
      }
  },
  asset_category: "Cycle Hangars",
  attributes: {}
});

fixmystreet.assets.add(wfs_defaults, {
  http_options: {
      params: {
          TYPENAME: "greenspaces:park_bench",
      }
  },
  asset_category: "Benches",
  attributes: {}
});


/** These layers are served directly from Alloy: 

// View all layers with something like:
// curl https://tilma.staging.mysociety.org/resource-proxy/proxy.php\?https://hackney.assets/ | jq '.results[] | .layer.code, ( .layer.styles[] | { id, name } ) '

*/


var layers = [

  {
    "categories": ["Highways", "Pothole", "Flooding"],
    "item_name": "Road Section",
    "layer_name": "Adopted Network",
    "styleid": "60ae2e677e3bbd02324cb8c7",
    "asset_type": "road",
    
    "layerid": "layers_adoptedNetwork_5ef4add3457bbc00569b52a0"
  },

];



var northumberland_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
  class: OpenLayers.Layer.NCCVectorAsset,
  protocol_class: OpenLayers.Protocol.AlloyV2,
  http_options: {
    base: "/resource-proxy/proxy.php?http://layers/${layerid}/${x}/${y}/${z}/cluster?styleIds=${styleid}"
  },
  non_interactive: false,
	road: true,
    always_visible: true,
        asset_type: 'road',
  asset_item: 'road',
  body: "Northumberland County Council",
  attributes: {
    asset_resource_id: function() {
      return this.fid;
    }
  }
});

fixmystreet.alloy_add_layers(northumberland_defaults, layers);

})();
