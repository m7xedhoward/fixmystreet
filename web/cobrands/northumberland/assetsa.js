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


var defaults = {
    wfs_url: '/geoserver/map/ows',
    asset_type: 'spot',
    max_resolution: 4.777314267158508,
    geometryName: 'msGeometry',
    srsName: "EPSG:3857",
    body: "Northumberland County Council",
    strategy_class: OpenLayers.Strategy.FixMyStreet
}; 

 /*
fixmystreet.assets.add(wfs_spot, {
  http_options: {
      params: {
            TYPENAME: "map:street_lighting"
      }
  },
    asset_id_field: 'fid',
    attributes: {
        feature_id: 'unitno'
    },
    asset_category: ["Street Lighting Issue"],
  attributes: {}
});

*/

fixmystreet.assets.add(defaults, {
    select_action: true,
    stylemap: streetlight_stylemap,
    wfs_feature: "Street_Lights",
    asset_id_field: 'unitno',
    attributes: {
        feature_id: 'unitno',
        column_no: 'column'
    },
    asset_category: ["Street Lighting Issue"],
    asset_item: 'street light',
    feature_code: 'unitno',
    actions: {
        asset_found: fixmystreet.assets.named_select_action_found,
        asset_not_found: fixmystreet.assets.named_select_action_not_found
    }
});




function road_owned(f) {
    return f &&
           f.attributes &&
           f.attributes.section_co;
}


function occ_does_not_own_feature(f) {
    return !occ_owns_feature(f);
}

var owned_default_style = new OpenLayers.Style({
    fillColor: "#868686",
    fillOpacity: 0.6,
    strokeColor: "#000000",
    strokeOpacity: 0.6,
    strokeWidth: 2,
    pointRadius: 4,
    title: 'Not maintained by Oxfordshire County Council. Maintained by ${maintained_by}.'
});

var rule_owned = new OpenLayers.Rule({
    filter: new OpenLayers.Filter.FeatureId({
        type: OpenLayers.Filter.Function,
        evaluate: occ_owns_feature
    }),
    symbolizer: {
        fillColor: "#007258",
        pointRadius: 6,
        title: ''
    }
});

var rule_not_owned = new OpenLayers.Rule({
    filter: new OpenLayers.Filter.FeatureId({
        type: OpenLayers.Filter.Function,
        evaluate: occ_does_not_own_feature
    })
});

owned_default_style.addRules([rule_owned, rule_not_owned]);

var owned_stylemap = new OpenLayers.StyleMap({
    'default': owned_default_style,
    'select': fixmystreet.assets.style_default_select,
    'hover': occ_hover
});


var occ_ownernames = [
    "LocalAuthority", "CountyCouncil", 'ODS'
];

function occ_owns_feature(f) {
    return f &&
           f.attributes
}

function occ_does_not_own_feature(f) {
    return !occ_owns_feature(f);
}

fixmystreet.assets.add(defaults, {
    stylemap: fixmystreet.assets.stylemap_invisible,
    wfs_feature: "adopted_network",
    propertyNames: ['section_co', 'road_name', 'geom'],
    srsName: "EPSG:27700",
    section_code: {
        attribute: 'section_co',
        field: 'section_co'
    },
    non_interactive: true,
    road: true,
    no_asset_msg_id: '#js-not-a-road',
    asset_item: 'road',
    asset_type: 'road',
    actions: {
        found: function(layer, feature) {
            fixmystreet.message_controller.road_found(layer, feature, road_owned, '#js-not-a-road');
        },
        not_found: fixmystreet.message_controller.road_not_found
    },
    asset_category: [
        "Bridges",
        "Carriageway Defect",
        "Current Roadworks",
        "Drainage",
        "Gully and Catchpits",
        "Highway Schemes",
        "Ice/Snow",
        "Manhole",
        "Pavements",
        "Pothole",
        "Road Traffic Signs and Road Markings",
        "Roads/highways",
        "Street lighting",
        "Traffic Lights (permanent only)",
        "Trees"
    ]
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
var layers = [
  {
    "categories": ["Street Lighting", "Lamposts"],
    "item_name": "street light",
    "layer_name": "Street Lights",
    "styleid": "5d308d57fe2ad8046c67cdb5",
    "layerid": "layers_streetLightingAssets"
  },
  {
    "categories": ["Illuminated Bollards", "Non-illuminated Bollards"],
    "item_name": "bollard",
    "layer_name": "Bollards",
    "styleid": "5d308d57fe2ad8046c67cdb9",
    "layerid": "layers_streetLightingAssets"
  },
  {
    "categories": ["Benches"],
    "item_name": "bench",
    "layer_name": "Bench",
    "styleid": "5e8b16f0ca31500f60b3f589",
    "layerid": "layers_bench_5e8b15f0ca31500f60b3f568"
  },
  {
    "categories": ["Potholes"],
    "item_name": "road",
    "layer_name": "Carriageway",
    "styleid": "5d53d28bfe2ad80fc4573184",
    "layerid": "layers_carriageway_5d53cc74fe2ad80c3403b77d"
  },
  {
    "categories": ["Road Markings / Lines"],
    "item_name": "road",
    "layer_name": "Markings",
    "styleid": "5d308dd7fe2ad8046c67da33",
    "layerid": "layers_highwayAssets"
  },
  {
    "categories": ["Pavement"],
    "item_name": "pavement",
    "layer_name": "Footways",
    "styleid": "5d308dd6fe2ad8046c67da2a",
    "layerid": "layers_highwayAssets"
  },
  {
    "categories": ["Cycle Tracks"],
    "item_name": "cycle track",
    "layer_name": "Cycle Tracks",
    "styleid": "5d308dd6fe2ad8046c67da29",
    "layerid": "layers_highwayAssets"
  },
  {
    "categories": ["Drains and gutters"],
    "item_name": "drain",
    "layer_name": "Gullies",
    "styleid": "5d308dd6fe2ad8046c67da2e",
    "layerid": "layers_highwayAssets"
  },
  {
    "categories": ["Verges"],
    "item_name": "verge",
    "layer_name": "Verges",
    "styleid": "5d308dd7fe2ad8046c67da36",
    "layerid": "layers_highwayAssets"
  },
  {
    "categories": ["Road Hump Fault / Damage"],
    "item_name": "road hump",
    "layer_name": "Traffic Calming",
    "styleid": "5d308dd7fe2ad8046c67da35",
    "layerid": "layers_highwayAssets"
  },
  {
    "categories": ["Broken or Faulty Barrier Gates"],
    "item_name": "barrier gate",
    "layer_name": "Gates",
    "styleid": "5d308dd6fe2ad8046c67da2c",
    "layerid": "layers_highwayAssets"
  },
  {
    "categories": ["Belisha Beacon"],
    "item_name": "beacon",
    "layer_name": "Belisha Beacon",
    "styleid": "5d308d57fe2ad8046c67cdb6",
    "layerid": "layers_streetLightingAssets"
  },
  {
    "categories": ["Loose or Damaged Kerb Stones"],
    "item_name": "kerb",
    "layer_name": "Kerbs",
    "styleid": "5d308dd6fe2ad8046c67da30",
    "layerid": "layers_highwayAssets"
  }
];

*/

var northumberland_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
  class: OpenLayers.Layer.NCCVectorAsset,
  protocol_class: OpenLayers.Protocol.AlloyV2,
  http_options: {
    base: ""
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
