define([], function() {
  return {
    map: {
      options: {
        basemap: 'national-geographic',
        center : [-80.422218,37.227590],
        zoom : 15,
        sliderStyle: "large",
        minZoom: 12, 
        logo: false,
        lods: [
          {
            "level" : 0,
            "resolution" : 156543.033928,
            "scale" : 591657527.591555
          }, 
          { 
            "level" : 1,
            "resolution" : 78271.5169639999,
            "scale" : 295828763.795777
          }, 
          {
            "level" : 2,
            "resolution" : 39135.7584820001,
            "scale" : 147914381.897889
          }, 
          {
            "level" : 3,
            "resolution" : 19567.8792409999,
            "scale" : 73957190.948944
          }, 
          {
            "level" : 4,
            "resolution" : 9783.93962049996,
            "scale" : 36978595.474472
          }, 
          {
            "level" : 5,
            "resolution" : 4891.96981024998,
            "scale" : 18489297.737236
          }, 
          {
            "level" : 6,
            "resolution" : 2445.98490512499,
            "scale" : 9244648.868618
          }, 
          {
            "level" : 7,
            "resolution" : 1222.99245256249,
            "scale" : 4622324.434309
          }, 
          {
            "level" : 8,
            "resolution" : 611.49622628138,
            "scale" : 2311162.217155
          }, 
          {
            "level" : 9,
            "resolution" : 305.748113140558,
            "scale" : 1155581.108577
          }, 
          {
            "level" : 10,
            "resolution" : 152.874056570411,
            "scale" : 577790.554289
          }, 
          {
            "level" : 11,
            "resolution" : 76.4370282850732,
            "scale" : 288895.277144
          }, 
          {
            "level" : 12,
            "resolution" : 38.2185141425366,
            "scale" : 144447.638572
          }, 
          {
            "level" : 13,
            "resolution" : 19.1092570712683,
            "scale" : 72223.819286
          }, 
          {
            "level" : 14,
            "resolution" : 9.55462853563415,
            "scale" : 36111.909643
          }, 
          {
            "level" : 15,
            "resolution" : 4.77731426794937,
            "scale" : 18055.954822
          }, 
          {
            "level" : 16,
            "resolution" : 2.38865713397468,
            "scale" : 9027.977411
          },
          {
            "level" : 17,
            "resolution" : 1.1943285668550503,
            "scale" : 4513.988705
          },
          {
            "level" : 18,
            "resolution" : 0.5971642835598172,
            "scale" : 2256.994353
          },
          {
            "level" : 19,
            "resolution" : 0.29858214164761665,
            "scale"  : 1128.497176
          },
          {
            "level" : 20,
            "resolution" : 0.14929107082380833,
            "scale" : 564.248588
          }
        ],
        infoWindow: null,
      },
      basemaps: {
        vtBasemap: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/Basemap/MapServer",
        basemapNG: "http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer",
        basemapTOB: "http://gisservices.blacksburg.gov/arcgis/rest/services/Map_Services/BASE_Map/MapServer",
        schematicThumbnail: "http://web.gis.vt.edu/vtcampusmap/images/basemap-thumbnail-vt.jpg",
        pictometry: "http://birdseye.gis.vt.edu/arcgis/rest/services/pictometry2013/MapServer",
        pictometryThumbnail: "http://web.gis.vt.edu/vtcampusmap/images/basemap-thumbnail-imagery.jpg"
      },
      locatorService: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/VTAddressPoints/GeocodeServer",
      gazeteerLayer: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/VTPlaceNames/MapServer",
      featuredPlaces : [
        {
          "lat": 37.225351,
          "lng":-80.423796,
          "name":"Ag Quad"
        },
        {
          "lat": 37.229054,
          "lng":-80.423769,
          "name":"Burruss Hall"
        },
        {
          "lat": 37.222537,
          "lng":-80.419021,
          "name":"Cassell Coliseum"
        },
        {
          "lat": 37.231783,
          "lng":-80.418371,
          "name":"Center for the Arts"
        },
        {
          "lat": 37.229922,
          "lng":-80.424688,
          "name":"Cowgill Hall"
        },
        {
          "lat": 37.228995,
          "lng":-80.425622,
          "name":"Derring Hall"
        },
        {
          "lat": 37.224545,
          "lng":-80.421081,
          "name":"Dietrick Hall"
        },
        {
          "lat": 37.227429,
          "lng":-80.42223,
          "name":"Drillfield"
        },
        { 
          "lat": 37.225941,
          "lng":-80.428249,
          "name":"Duck Pond"
        },
        {
          "lat": 37.228272,
          "lng":-80.417516,
          "name":"Graduate Life Center"
        },
        {
          "lat": 37.219414,
          "lng":-80.424276,
          "name":"Hahn Horticulture Garden"
        },
        {
          "lat": 37.230347,
          "lng":-80.416911,
          "name":"Henderson Hall"
        },
        {
          "lat": 37.229782,
          "lng":-80.429599,
          "name":"Inn at Virginia Tech & Skelton Conference Center"
        },
        {
          "lat": 37.219889,
          "lng":-80.418098,
          "name":"Lane Stadium"
        },
        {
          "lat": 37.231212,
          "lng":-80.422828,
          "name":"Lavery Hall"
        },
        {
          "lat": 37.224503,
          "lng":-80.418505,
          "name":"Lee Hall"
        },
        {
          "lat": 37.220246,
          "lng":-80.422537,
          "name":"McComas Hall"
        },
        {
          "lat": 37.221544,
          "lng":-80.419101,
          "name":"Merryman Center"
        },
        {
          "lat": 37.228932,
          "lng":-80.419217,
          "name":"Newman Library"
        },
        {
          "lat": 37.226624,
          "lng":-80.418956,
          "name":"Owens Hall"
        },
        {
          "lat": 37.216069,
          "lng":-80.418329,
          "name":"Parking Services"
        },
        {
          "lat": 37.230637,
          "lng":-80.420873,
          "name":"Performing Arts Building"
        },
        {
          "lat": 37.228909,
          "lng":-80.420342,
          "name":"Pylons"
        },
        {
          "lat": 37.217958,
          "lng":-80.432142,
          "name":"Smithfield Plantation"
        },
        {
          "lat": 37.229557,
          "lng":-80.418021,
          "name":"Squires Student Center"
        },
        {
          "lat": 37.222099,
          "lng":-80.421803,
          "name":"Student Services Building"
        },
        {
          "lat":37.230269,
          "lng":-80.416352,
          "name":"Theatre 101"
        },
        {
          "lat":37.217624,
          "lng":-80.427927,
          "name":"Veterinary Teaching Hospital"
        },
      ],
      featureLayers : [
        {
          label: "VT Campus Grid",
          layerURL: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/UniRelGrid/MapServer",
          visible: false,
          opacity: 1,
          identifyLayers: []
        },
        {
          label: "Roads",
          layerURL: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/Roads/MapServer",
          visible: true,
          opacity: 1,
          identifyLayers: []
        },
        {
          label: "Parking Lots",
          layerURL: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/ParkingLots/MapServer",
          visible: true,
          opacity: 1,
          identifyLayers: [
            {
              layerId: 0,
              layerName: "Parking Lots",
              itle: "${LOT_NAME} Parking Lot",
              fields: [
                {
                  title: "Lot Name",
                  value: "${LOT_NAME}"
                },
                {
                  title: "Lot Number",
                  value: "${LOT_NUMBER}"
                }
              ]
            }
          ]
        },
        {
          label: "Parking Spaces",
          layerURL: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/ParkingSpaces/MapServer",
          visible: true,
          opacity: 1,
          identifyLayers: []
        },        
        {
          label: "Emergency Phones",
          layerURL: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/EmergencyPhones/MapServer",
          visible: true,
          opacity: 1,
          identifyLayers: []
        },
        
        {
          label: "Buildings",
          layerURL: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/Buildings/MapServer",
          visible: true,
          opacity: 1,
          identifyLayers: [
            {
              layerId: 0,
              layerName: "Buildings",
              title: "${NAME}",
              fields: [
                {
                  title: "Building Use",
                  value: "${BLDG_USE}"
                },
                {
                  title: "Building Name",
                  value: "${NAME}"
                },
                {
                  title: "Building Number",
                  value: "${BLDG_NUM}"
                },
                {
                  title: "Address",
                 value: "${STNUM:formatContent} ${STPREDIR:formatContent} ${STNAME:formatContent} ${STSUFFIX:formatContent} ${STPOSTDIR:formatContent}"
                },
                {
                  title: "URL",
                  value: "<a href='${URL:formatContent}' " +
                         "target = '_blank' > Building Information </a>"
                }
              ]
            }
          ]
        },
        {
          label: "Athletic Parking Lots",
          layerURL: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/AthleticLots/MapServer",
          visible: false,
          opacity: 1,
          identifyLayers: []
        },
        {
          label: "Alternative Transportation",
          layerURL: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/AlternateTransportation/MapServer",
          visible: true,
          opacity: 1,
          identifyLayers: [
            {
              layerId: 0,
              layerName: "Bus Stops",
              title: "Bus Stop ${ID}",
              fields: [
                { title: "ID", value: "${ID}" },
                { title: "Bench", value: "${BENCH}" },
                { title: "Bench Count", value: "${BENCHCOUNT}" },
                { title: "Have Shelter", value: "${SHELTER}" },
                {
                  title:"Image",
                  value:"<img src='${URL}' width='200px' height='200px' />"
                }
              ]
            },
            {
              layerId: 1,
              layerName: "Bike Racks",
              title: "Bike Rack ${ID}",
              fields: [
                { title: "ID", value: "${ID}" },
                { title: "Condition", value: "${CONDITION}" },
                { title: "Covered", value: "${COVERED}" },
                { title: "Max Park Size", value: "${MAXPARK}"},
                {
                  title: "Number of Bikes",
                  value: "${NUMBIKES}"
                },
                {
                  title: "Rack Style",
                  value: "${RACKSTYLE}"
                },
                {
                  title: "Number of Racks",
                  value: "${RACKS}"
                },
                {
                  title: "Rack Type",
                  value: "${RACKTYPE}"
                },
                {
                  title: "Image",
                  value: "<img src='${URL}' width='200px' height='200px' />"
                }
              ]
            }
          ]
        },
        {
          label: "Accessibility",
          layerURL: "http://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/Accessibility/MapServer",
          visible: true,
          opacity: 1,
          identifyLayers: []
        }
      ]
    },
    configs: {
      searchResultZoom: 18,
      searchResultExtentTolerance: 50,
      pointTolerance: 0.8,
      PictureMarker: "imgs/pictureSymbol.png"
    },
    about: {
      moreInfoUrl: 'http://www.maps.vt.edu/'
    }
  };
});
