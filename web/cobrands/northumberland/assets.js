(function(){

if (!fixmystreet.maps) {
    return;
}

var base_url = fixmystreet.staging ?
      "/resource-proxy/proxy.php?http://layers/${layerid}/${x}/${y}/${z}/cluster" :
      "/resource-proxy/proxy.php?http://layers/${layerid}/${x}/${y}/${z}/cluster";

var url_with_style = base_url + '?styleIds=${styleid}';

var layers = [
{
  "categories": [
        "Loose / Raised/Sunken",
        "Broken / Missing",
        "Blocked - flooding private property",
        "Blocked - flooding road/path",
        "Blocked/Damaged",
  ],
  "item_name": "drain",
  "layer_name": "Gully",
  "styleid": '5d480b8ffe2ad809d85a78ff',
  "max_resolution": 0.5971642833948135
},
{
  "categories": [ "Grit Bin - damaged/replacement", "Grit Bin - empty/refill" ],
  "item_name": "grit bin",
  "layer_name": "Grit Bins",
  "styleid": '5d480942fe2ad809d85a78ad',
},
{
  "categories": [ "Highway Bridges - Damaged/Unsafe" ],
  "asset_type": 'area',
  "item_name": 'bridge',
  "layer_name": "Structures",
  "styleid": '5d4809fffe2ad8059ce44bbe',
},
{
  "categories": [ "Damaged / Missing / Facing Wrong Way", "Obscured by vegetation or Dirty" ],
  "item_name": "sign",
  "layer_name": "Signs",
  "styleid": '5d480a8ffe2ad809d85a78d3',
},
{
  "categories": [ "Shelter Damaged", "Sign/Pole Damaged" ],
  "layer_name": "Bus Stop",
  "styleid": '5d4812dffe2ad809d85a7a72',
},
{
  "categories": [
      "Fallen Tree",
      "Restricted Visibility / Overgrown / Overhanging",
      "Restricted Visibility"
  ],
  "layer_name": "Tree",
  "styleid": '5d481376fe2ad8059ce44ef2',
},
{
  "categories": [ "Safety Bollard - Damaged/Missing" ],
  "layer_name": "Safety Bollard",
  "styleid": "5d481446fe2ad8059ce44f02",
},
 {
    "categories": ["Highways", "Pothole", "Flooding"],
    "item_name": "Road Section",
    "layer_name": "Adopted Network",
    "styleid": "5ef5c9d6e2950d005648deab",
  },
];

var prow_assets = [
{
  "categories": [ "Bridge-Damaged/ Missing" ],
  "item_name": "bridge or right of way",
  "layer_name": "BRIDGES",
  "styleid": "5d48161ffe2ad809d85a7add"
},
{
  "categories": [ "Gate - Damaged/ Missing" ],
  "item_name": "gate or right of way",
  "layer_name": "GATE",
  "styleid": "5d481906fe2ad8059ce450b4",
},
{
  "categories": [ "Stile-Damaged/Missing" ],
  "item_name": "stile or right of way",
  "layer_name": "STILE",
  "styleid": "5d481a05fe2ad8059ce45121",
},
{
  "categories": [ "Sign/Waymarking - Damaged/Missing" ],
  "item_name": "waymarking or right of way",
  "layer_name": "WAYMARK POST",
  "styleid": "5d481a4ffe2ad809d85a7b90&styleIds=5d481742fe2ad809d85a7b05"
},
];

var highway_layer = 'layers_fixMyStreet_6307563c557b6f0153166a93';



var northumberland_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
  class: OpenLayers.Layer.AlloyVectorAsset,
  protocol_class: OpenLayers.Protocol.AlloyV2,
  http_options: {
      base: url_with_style,
      layerid: highway_layer
  },
  non_interactive: true,
  body: "Northumbeland County Council",
  attributes: {
    asset_resource_id: "itemId"
  },
  select_action: true,
  actions: {
    asset_found: function(asset) {
      if (fixmystreet.message_controller.asset_found()) {
          return;
      }
      var lonlat = asset.geometry.getBounds().getCenterLonLat();
      // Features considered overlapping if within 1M of each other
      // TODO: Should zoom/marker size be considered when determining if markers overlap?
      var overlap_threshold = 1;
      var overlapping_features = this.getFeaturesWithinDistance(
          new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat),
          overlap_threshold
      );
      if (overlapping_features.length > 1) {
          // TODO: In an ideal world we'd be able to show the user a photo of each
          // of the assets and ask them to pick one.
          // However the Alloy API requires authentication for photos which we
          // don't have in FMS JS. Instead, we tell the user there are multiple things here
          // and ask them to describe the asset in the description field.
          var $p = $("#overlapping_features_msg");
          if (!$p.length) {
              $p = $("<p id='overlapping_features_msg' class='hidden box-warning'>" +
              "There is more than one <span class='overlapping_item_name'></span> at this location. " +
              "Please describe which <span class='overlapping_item_name'></span> has the problem clearly.</p>");
              $('#category_meta').before($p).closest('.js-reporting-page').removeClass('js-reporting-page--skip');
          }
          $p.find(".overlapping_item_name").text(this.fixmystreet.asset_item);
          $p.removeClass('hidden');
      } else {
          $("#overlapping_features_msg").addClass('hidden');
      }

    },
    asset_not_found: function() {
      $("#overlapping_features_msg").addClass('hidden');
      fixmystreet.message_controller.asset_not_found.call(this);
    }
  }
});

fixmystreet.alloy_add_layers(northumberland_defaults, layers);

//var prow_defaults = $.extend(true, {}, northumberland_defaults, {
//  http_options: {    layerid: prow_asset_layer
//  }
//});

//fixmystreet.alloy_add_layers(prow_defaults, prow_assets);

//var signals_defaults = $.extend(true, {}, northumberland_defaults, {
//  http_options: {
//    layerid: signal_asset_layer
//  }
//});


//fixmystreet.assets.add(signals_defaults, {
//  http_options: {
//    layer_id: signal_asset_layer,
//    styleid: "5ef5c9d6e2950d005648deab",
//  },
//  asset_category: [
//    "Damaged/Exposed Wiring / Vandalised",
//    "Lamp/Bulb Failure",
//    "Signal Failure",
//    "Signal Failure all out",
 //   "Signal Stuck",
//    "Signal Head Failure",
//    "Request Timing Review",
//    "Damaged Control box",
//    "Signal Failure/Damaged - Toucan/Pelican"
//  ],
//  asset_item: "signal or crossing"
//});

// NCC roads layers which prevent report submission unless we have selected
// an asset.




var northumberland_road_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
    class: OpenLayers.Layer.AlloyVectorAsset,
    class: OpenLayers.Layer.AlloyVectorNearest,
    protocol_class: OpenLayers.Protocol.AlloyV2,
    http_options: {
        base: url_with_style,
        layerid: highway_layer
    },
    body: "Northumberland County Council",
    road: true,
    always_visible: false,
    non_interactive: true,
    asset_item: 'road',
    
    attributes: {
    // feature_id
    asset_resource_id: "itemId"
    },
    //item_name: "Road Section",
    //asset_type: 'road', 


    no_asset_msg_id: '#js-not-a-road',
    usrn: {
        attribute: 'itemId',
        field: 'asset_resource_id'
    },

   // usrn: {
   //   attribute: 'subtitle',
   //   field: 'subtitle'
   // },

    getUSRN: function(feature) {
      return feature.fid;
    },

    // feature_code: 'title',

    construct_selected_asset_message: function(asset) {
      //console.log('construct')
          var last_clean = asset.attributes.title || '';
          //var next_clean = asset.attributes.Gully_Next_Clean_Date__c || '';
          //if (last_clean !== '' || next_clean !== '') {
              var message = last_clean;
              //if (last_clean) { message += '<b>Last Cleaned</b>: ' + last_clean; }
              //if (next_clean) { message += ' <b>Next Clean</b>: ' + next_clean; }
              return message;
          },
      
    actions: {
      found: function(asset) {
        //console.log('Found!')
      	//console.log(asset)
        fixmystreet.message_controller.road_found(asset);


        var msg = 'The location selected may have scheduled inspections listed below: ';
        var alloydatetime = asset.selected_feature.attributes.subtitle
        var alloydate = alloydatetime.replace(/\b(\d{2}\:\d{2}\:\d{2})/, '');

        if ( asset.selected_feature.attributes.subtitle !== 'AdoptedNetwork') {
          if ( $('#road-warning').length ) {
              $('#road-warning').html(msg + '<p><p>' + alloydate );
              $('#road-warning').css('background-color','#B33A3A')
              $('#road-warning').fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300)
          } else {
              $('.change_location').after('<div class="box-warning" id="road-warning">' + msg + '<p><p>' + alloydate + '</div>')
              $('#road-warning').fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300)
                            $('#road-warning').css('background-color','#B33A3A')
              
          }
        } else {$('#road-warning').remove();}


        // var id = asset.attributes || '';
        // if (id !== '') {
        //     var code = id.replace(/[0-9]/g, '');
        //     // var asset_name = streetlight_code_to_type[code] || this.fixmystreet.asset_item;
        //     $('.category_meta_message').html('You have selected ' +  + ' <b>' + id + '</b>');
        // } else {
        //     $('.category_meta_message').html('You can pick a <b class="asset-spot">' + '</b> from the map &raquo;');
        // }
      }, 
      not_found: function(asset) {
        fixmystreet.message_controller.road_not_found(asset);
        if ( $('#road-warning').length ) {
            $('#road-warning').remove();
        }
      },
      // asset_found: function(asset) {
      //   if (fixmystreet.message_controller.asset_found.call(this)) {
      //       return;
      //   }
      //   fixmystreet.assets.named_select_action_found.call(this, asset);
      // },
      // asset_not_found: function() {
      //   fixmystreet.message_controller.asset_not_found.call(this);
      //   fixmystreet.assets.named_select_action_not_found.call(this);
      // }  
      }
});

var northumberland_prow_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
    class: OpenLayers.Layer.AlloyVectorAsset,
    class: OpenLayers.Layer.AlloyVectorNearest,
    protocol_class: OpenLayers.Protocol.AlloyV2,
    http_options: {
        base: url_with_style,
        layerid: highway_layer
    },
    body: "Northumberland County Council",
    road: true,
    always_visible: false,
    non_interactive: true,
    asset_item: 'road',
    
    attributes: {
    // feature_id
    asset_resource_id: "itemId"
    },
    //item_name: "Road Section",
    //asset_type: 'road', 


    no_asset_msg_id: '#js-not-a-road',
    usrn: {
        attribute: 'itemId',
        field: 'asset_resource_id'
    },

   // usrn: {
   //   attribute: 'subtitle',
   //   field: 'subtitle'
   // },

    getUSRN: function(feature) {
      return feature.fid;
    },

    // feature_code: 'title',

      
    actions: {
      found: function(asset) {
        //console.log('Found!')
      	console.log(asset)
        fixmystreet.message_controller.road_found(asset);


        // var id = asset.attributes || '';
        // if (id !== '') {
        //     var code = id.replace(/[0-9]/g, '');
        //     // var asset_name = streetlight_code_to_type[code] || this.fixmystreet.asset_item;
        //     $('.category_meta_message').html('You have selected ' +  + ' <b>' + id + '</b>');
        // } else {
        //     $('.category_meta_message').html('You can pick a <b class="asset-spot">' + '</b> from the map &raquo;');
        // }
      }, 
      not_found: function(asset) {
        fixmystreet.message_controller.road_not_found(asset);
      },
      // asset_found: function(asset) {
      //   if (fixmystreet.message_controller.asset_found.call(this)) {
      //       return;
      //   }
      //   fixmystreet.assets.named_select_action_found.call(this, asset);
      // },
      // asset_not_found: function() {
      //   fixmystreet.message_controller.asset_not_found.call(this);
      //   fixmystreet.assets.named_select_action_not_found.call(this);
      // }  
      }
});

// var defect_popup;

// function show_defect_popup(feature) {
//     defect_popup = new OpenLayers.Popup.FramedCloud(
//         "nccDefects",
//         feature.geometry.getBounds().getCenterLonLat(),
//         null,
//         feature.attributes.title.replace("\n", "<br />"),
//         { size: new OpenLayers.Size(0, 0), offset: new OpenLayers.Pixel(6, -46) },
//         true,
//         close_defect_popup
//     );
//     fixmystreet.map.addPopup(defect_popup);
// }

// function close_defect_popup() {
//     if (!!defect_popup) {
//         fixmystreet.map.removePopup(defect_popup);
//         defect_popup.destroy();
//         defect_popup = null;
//     }
// }

// // Handle clicks on defect pins when showing duplicates
// function setup_defect_popup() {
//     var select_defect = new OpenLayers.Control.SelectFeature(
//         fixmystreet.markers,
//         {
//             hover: true,
//             clickFeature: function (feature) {
//                 close_defect_popup();
//                 if (feature.attributes.colour !== 'defects') {
//                     // We're only interested in defects
//                     return;
//                 }
//                 show_defect_popup(feature);
//             }
//         }
//     );
//     fixmystreet.map.addControl(select_defect);
//     select_defect.activate();
// }

// function handle_marker_click(e, feature) {
//     close_defect_popup();

//     // Show popups for defects, which have negative fake IDs
//     if (feature.attributes.id < 0) {
//         show_defect_popup(feature);
//     }
// }

// $(fixmystreet).on('maps:render_duplicates', setup_defect_popup);
// $(fixmystreet).on('maps:marker_click', handle_marker_click);
// $(fixmystreet).on('maps:click', close_defect_popup);



// onmapclicky = function (asset) {
//   const coordinate = evt.coordinate;
//   const hdms = toStringHDMS(toLonLat(coordinate));

//   content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
//   overlay.setPosition(coordinate);
// };




var northumberland_spot_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
  class: OpenLayers.Layer.AlloyVectorAsset,
  protocol_class: OpenLayers.Protocol.AlloyV2,
  http_options: {
      base: url_with_style,
      layerid: highway_layer
  },
  body: "Northumberland County Council",
  // road: true,
  
  spot: true,
  asset_type: 'spot',
  always_visible: false,
  non_interactive: false,
  

  //item_name: "Road Section",
  //asset_type: 'road', 

  attributes: {
    // feature_id
    unit_number: "title",
    asset_resource_id: "itemId"
  },
  
  select_action: true,
  feature_code: 'title',
  asset_item: 'title',
  asset_id_field: 'itemId',
  actions: {
    asset_found: function(asset) {
      if (fixmystreet.message_controller.asset_found.call(this)) {
          return;
      }
      fixmystreet.assets.named_select_action_found.call(this, asset);
    },
    asset_not_found: function() {
      fixmystreet.message_controller.asset_not_found.call(this);
      fixmystreet.assets.named_select_action_not_found.call(this);
    }
  }

  // no_asset_msg_id: '#js-not-a-road',
  // usrn: {
  //   attribute: 'itemId',
  //   field: 'asset_resource_id'
  // },
  // getUSRN: function(feature) {
  //   return feature.fid;
  // },
  // actions: {
  //     found: fixmystreet.message_controller.road_found,
  //     not_found: fixmystreet.message_controller.road_not_found
  //  }
  // usrn: {
  //         attribute: 'itemId',
  //         field: 'asset_resource_id'
  //     },



  //   getUSRN: function(feature) {
  //     console.log(feature.fid);
  //     return feature.fid;
  //   },

  //   construct_selected_asset_message: function(asset) {
  //     var last_clean = asset.attributes.title || '';
  //     var next_clean = asset.attributes.Gully_Next_Clean_Date__c || '';
  //     if (last_clean !== '' || next_clean !== '') {
  //         var message = '';
  //         if (last_clean) { message += '<b>Last Cleaned</b>: ' + last_clean; }
  //         if (next_clean) { message += ' <b>Next Clean</b>: ' + next_clean; }
  //         return message;
  //     }
  //   },
  //   actions: {
  //     asset_found: function(asset) {
  //         fixmystreet.message_controller.asset_found.call(this, asset);
  //         fixmystreet.assets.named_select_action_found.call(this, asset);
  //     },
  //     asset_not_found: function() {
  //         fixmystreet.message_controller.asset_not_found.call(this);
  //         fixmystreet.assets.named_select_action_not_found.call(this);
  //     }
  // }
});


var northumberland_area_defaults = $.extend(true, {}, fixmystreet.alloyv2_defaults, {
  protocol_class: OpenLayers.Protocol.AlloyV2,
  http_options: {
      base: url_with_style,
      layerid: highway_layer
  },
  body: "Northumberland County Council",
  // road: true,
  
  //spot: true,
  area: true,
  asset_type: 'area',
  always_visible: false,
  non_interactive: false,
  

  //item_name: "Road Section",
  //asset_type: 'road', 


  no_asset_msg_id: '#js-not-a-road',
  usrn: {
      attribute: 'itemId',
      field: 'asset_resource_id'
  },
  getUSRN: function(feature) {
    return feature.fid;
  },
  actions: {
      found: fixmystreet.message_controller.road_found,
      not_found: fixmystreet.message_controller.road_not_found
  }
});

var barrier_style = new OpenLayers.Style({
    fill: false,
    strokeColor: "#555555",
    strokeOpacity: 1,
    strokeWidth: 4
});


// var highways_style = new OpenLayers.Style({
//     fill: false,
//     strokeColor: "#c74224",
//     strokeOpacity: 0.0,
//     strokeWidth: 0
// });

// var highways_style_select = new OpenLayers.Style({
//   fill: false,
//   strokeColor: "#c74224",
//   strokeOpacity: 1,
//   strokeWidth: 0,
//   label: "${subtitle}",
//   fontColor: "#FFD800",
//   labelOutlineColor: "black",
//   labelOutlineWidth: 3,
//   labelYOffset: 69,
//   fontSize: '18px',
//   fontWeight: 'bold'
// });

var gully_style = new OpenLayers.Style({
  fill: true,
  strokeColor: "#c74224",
  strokeOpacity: 1.0,
  strokeWidth: 7
});

fixmystreet.assets.add(northumberland_road_defaults, {
    protocol_class: OpenLayers.Protocol.AlloyV2,
    // Carriageways

    http_options: {
      styleid: "630757dac3595c014dd96dc5",
    },
    stylemap: fixmystreet.assets.stylemap_invisible,
    //select_action: true,
    //stylemap: carpark_stylemap,
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
        "Restricted Visibility",
        "Damaged by vehicles"
    ]
});


var asset_fillColor = fixmystreet.cobrand === "northumberland" ? "#007258" : "#FFFF00";

var occ_default = $.extend({}, fixmystreet.assets.style_default.defaultStyle, {
    fillColor: asset_fillColor
});

var occ_hover = new OpenLayers.Style({
  pointRadius: 8,
  cursor: 'pointer'
});

var occ_stylemap = new OpenLayers.StyleMap({
  'default': occ_default,
  'select': fixmystreet.assets.style_default_select,
  'hover': occ_hover
});

var carpark_select = $.extend({
  label: "${subtitle}",
  fontColor: "#FFD800",
  labelOutlineColor: "black",
  labelOutlineWidth: 3,
  labelYOffset: 69,
  fontSize: '18px',
  fontWeight: 'bold'
}, fixmystreet.assets.style_default_select.defaultStyle);

var road_select = new OpenLayers.Style({
  label: "${subtitle}",
  fontColor: "#FFD800",
  labelOutlineColor: "black",
  labelOutlineWidth: 3,
  labelYOffset: 69,
  fontSize: '18px',
  fontWeight: 'bold'
});

var carpark_stylemap = new OpenLayers.StyleMap({
  'default': occ_default,
  'select': new OpenLayers.Style(carpark_select),
  'hover': new OpenLayers.Style(carpark_select)
});

// var road_stylemap = new OpenLayers.StyleMap({
//   'default': highways_style,
//   'select':road_select,
//   'hover': highways_style
// });

fixmystreet.assets.add(northumberland_area_defaults, {
  protocol_class: OpenLayers.Protocol.AlloyV2,
  // Car Parks
  asset_item: 'car park',
  http_options: {
    styleid: "632dc36799ce90015504dfd8",
  },
  stylemap: carpark_stylemap,
  // stylemap: new OpenLayers.StyleMap({
  //      'default': gully_style
  //  }),
  asset_category: ["Barrier problem","Faulty pay machine","Fly tipping/rubbish bin overflowing","Other car park issue","Road surface/pothole","Signs/lines issue"
  ]
});

fixmystreet.assets.add(northumberland_spot_defaults, {
  protocol_class: OpenLayers.Protocol.AlloyV2,
  // Gullys
  asset_item: 'gully',
  http_options: {
    styleid: "632db0a599ce900155040336",
  },
  // stylemap: new OpenLayers.StyleMap({
  //     'default': gully_style
  // }),
  asset_category: ["Blocked - flooding private property","Blocked - flooding road/path", "Broken / Missing","Damaged","Loose / Raised / Sunken"
  ]
});



fixmystreet.assets.add(northumberland_spot_defaults, {
  protocol_class: OpenLayers.Protocol.AlloyV2,
  // Lighting
  asset_item: 'lighting unit',

  http_options: {
    styleid: "632db7d5b192380154bbd699",
  },
  // stylemap: new OpenLayers.StyleMap({
  //     'default': gully_style
  // }),
  asset_category: ["Damaged / Missing / Facing Wrong Way", "Obscured by vegetation or Dirty"
  ]
});

fixmystreet.assets.add(northumberland_spot_defaults, {
  protocol_class: OpenLayers.Protocol.AlloyV2,
  // Traffic Crossings
  asset_item: 'item',

  http_options: {
    styleid: "632db8c8db3d43015a734d2f",
  },
  // stylemap: new OpenLayers.StyleMap({
  //     'default': gully_style
  // }),
  asset_category: ["Damaged/Exposed Wiring / Vandalised","Lamp/Bulb Failure","Request Timing Review","Signal Failure","Signal Failure all out","Signal Failure/Damaged - Toucan/Pelican","Signal Head Failure","Signal Stuck"
  ]
});


function ncc_match_prow_type(f, styleId) {
    return f &&
           f.attributes &&
           f.attributes.styleId &&
           f.attributes.styleId == styleId;
}

function ncc_prow_is_fp(f) {
    return ncc_match_prow_type(f, '638fa7b79e005f0396460cff' );
}

function ncc_prow_is_bw(f) {
    return ncc_match_prow_type(f, '638fa7859e005f0396460c18');
}

function ncc_prow_is_boat(f) {
    return ncc_match_prow_type(f, '638fa79bbafbd20397f5a72b');
}

function ncc_prow_is_rbyway(f) {
    return ncc_match_prow_type(f, '638fa7abbafbd20397f5a75b');
}


var rule_footpath = new OpenLayers.Rule({
    filter: new OpenLayers.Filter.FeatureId({
        type: OpenLayers.Filter.Function,
        evaluate: ncc_prow_is_fp
    }),
    symbolizer: {
        strokeColor: "#ff0000",
    }
});

var rule_boat = new OpenLayers.Rule({
    filter: new OpenLayers.Filter.FeatureId({
        type: OpenLayers.Filter.Function,
        evaluate: ncc_prow_is_boat
    }),
    symbolizer: {
        strokeColor: "#b7814a",
   }
});

var rule_bridleway = new OpenLayers.Rule({
    filter: new OpenLayers.Filter.FeatureId({
        type: OpenLayers.Filter.Function,
        evaluate: ncc_prow_is_bw
    }),
    symbolizer: {
        strokeColor: "#4de600",
    }
});

var prow_style = new OpenLayers.Style({
    fill: false,
    strokeColor: "#115511",
    strokeOpacity: 0.8,
    strokeWidth: 7
});

var rule_rbyway = new OpenLayers.Rule({
    filter: new OpenLayers.Filter.FeatureId({
        type: OpenLayers.Filter.Function,
        evaluate: ncc_prow_is_rbyway
    }),
    symbolizer: {
        strokeColor: "#f789d8",
    }
});


prow_style.addRules([rule_footpath, rule_boat, rule_bridleway]);

fixmystreet.assets.add(northumberland_prow_defaults, {
    // protocol_class: OpenLayers.Protocol.AlloyV2,
    // Rights of way

    http_options: {
      // PRoW Network
      base: base_url,
      layerid: 'layers_fixMyStreetPRoWs_638fa76405cb2503932eefea'
    },
    stylemap: new OpenLayers.StyleMap({
        'default': prow_style
    }),
    //stylemap: fixmystreet.assets.stylemap_invisible,
    //select_action: true,
    //stylemap: carpark_stylemap,
    asset_group: [
    	"Rights of Way"
    ]
});


//fixmystreet.assets.add(northumberland_road_defaults, {
//    http_options: {
      // PRoW Network
//      base: base_url,
//      layerid: 'layers_pRoWType_5d483b2ffe2ad809d85a8d9a'
//    },
//    stylemap: new OpenLayers.StyleMap({
//        'default': prow_style
//    }),
//    no_asset_msg_id: "#js-not-a-road",
//    asset_item: 'right of way',
//    asset_category: [
//      "Bridge-Damaged/ Missing",
 //     "Gate - Damaged/ Missing",
//      "Livestock",
//      "Passage-Obstructed/Overgrown",
//      "Sign/Waymarking - Damaged/Missing",
//      "Stile-Damaged/Missing"
//    ]
//});

fixmystreet.message_controller.add_ignored_body(northumberland_defaults.body);

})();
