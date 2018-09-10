define([], function () {
  return {
    map : {
      logo : false,
      zoom: 15,
      sliderStyle : 'small',
      showAttribution : false,
      center : [-80.422218, 37.227590],
      basemap: 'national-geographic',
      lods: [
        { level : 0, resolution : 156543.033928, scale : 591657527.591555 },
        { level : 1, resolution : 78271.5169639999, scale : 295828763.795777 },
        { level : 2, resolution : 39135.7584820001, scale : 147914381.897889 },
        { level : 3, resolution : 19567.8792409999, scale : 73957190.948944 },
        { level : 4, resolution : 9783.93962049996, scale : 36978595.474472 },
        { level : 5, resolution : 4891.96981024998, scale : 18489297.737236 },
        { level : 6, resolution : 2445.98490512499, scale : 9244648.868618 },
        { level : 7, resolution : 1222.99245256249, scale : 4622324.434309 },
        { level : 8, resolution : 611.49622628138, scale : 2311162.217155 },
        { level : 9, resolution : 305.748113140558, scale : 1155581.108577 },
        { level : 10, resolution : 152.874056570411, scale : 577790.554289 },
        { level : 11, resolution : 76.4370282850732, scale : 288895.277144 },
        { level : 12, resolution : 38.2185141425366, scale : 144447.638572 },
        { level : 13, resolution : 19.1092570712683, scale : 72223.819286 },
        { level : 14, resolution : 9.55462853563415, scale : 36111.909643 },
        { level : 15, resolution : 4.77731426794937, scale : 18055.954822 },
        { level : 16, resolution : 2.38865713397468, scale : 9027.977411 },
        { level : 17, resolution : 1.1943285668550503, scale : 4513.988705 },
        { level : 18, resolution : 0.5971642835598172, scale : 2256.994353 },
        { level : 19, resolution : 0.29858214164761665, scale  : 1128.497176 },
        { level : 20, resolution : 0.14929107082380833, scale : 564.248588 }
      ]
    },

    /* 1808 VT-EGIS - Note on layer names
    The ArcGIS REST API "identify?" operation returns results labeled with field
    aliases, if they are defined, instead of field names. (Other operations may
    behave differently.) If you are working with a server version >=10.5, a new
    "returnFieldName" flag can be used to force field name labeling.
    See: https://developers.arcgis.com/rest/services-reference/identify-map-service-.htm
    */

    layerInfos: [
      {
        url: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/UniRelGrid/MapServer',
        id: 'VT Campus Grid',
        hideOnStartup: true
      },
      {
        url: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/Roads/MapServer',
        id: 'Roads'
      },
      {
        url: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/ParkingLots/MapServer',
        id: 'Parking Lots',
        identifyLayers: [
          {
            infoTemplateTitle: '${LOT_NAME} Parking Lot',
            infoTemplateFields: [
              { title: 'Lot Name', value: '${LOT_NAME}' },
              { title: 'Lot Number', value: '${LOT_NUMBER}' }
            ]
          }
        ],
      },
      {
        url: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/ParkingSpaces/MapServer',
        id: 'Parking Spaces'
      },
      {
        url: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/EmergencyPhones/MapServer',
        id: 'Emergency Phones'
      },
      {
        url: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/Buildings/MapServer',
        id: 'Buildings',
        identifyLayers: [
          {
            infoTemplateTitle: '${NAME}',
            infoTemplateFields: [
              { title: 'Building Use', value: '${BLDG_USE}' },
              { title: 'Building Name', value: '${NAME}' },
              { title: 'Building Number', value: '${BLDG_NUM}' },
              { title: 'Address', value: '${STNUM} ${STPREDIR} ${STNAME} ${STSUFFIX} ${STPOSTDIR}' },
              { title: 'URL', value: '<a href="${URL}" target = "_blank" > ${URL} </a>' }
            ]
          }
        ]
      },
      {
        url: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/AthleticLots/MapServer',
        id: 'Athletic Parking Lots',
        hideOnStartup: true,
      },
      {
        url: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/AlternateTransportation/MapServer',
        id: 'Alternate Transportation',
        identifyLayers: [
          {
            layerName: 'Bus Stops',
            infoTemplateTitle: 'Bus Stop ${ID}',
            infoTemplateFields: [
              { title: 'ID', value: '${ID}' },
              { title: 'Bench', value: '${BENCH}' },
              { title: 'Bench Count', value: '${BENCHCOUNT}' },
              { title: 'Have Shelter', value: '${SHELTER}' },
              { title: 'Image', value: '<img src="${URL}" width="200px" height="200px" />' }
            ]
          },
          {
            layerName: 'Bike Racks',
            infoTemplateTitle: 'Bike Rack ${OBJECTID}',
            infoTemplateFields: [
              { title: 'ID', value: '${OBJECTID}' },
              { title: 'Condition', value: '${CONDITION}' },
              { title: 'Covered', value: '${COVERED}' },
              { title: 'Max Park Size', value: '${MAXPARK}' },
              { title: 'Number of Bikes', value: '${NUMBIKES}' },
              { title: 'Rack Style', value: '${RACKSTYLE}' },
              { title: 'Number of Racks', value: '${RACKS}' },
              { title: 'Rack Type', value: '${RACKTYPE}' }
              // ,
              // { title: 'Image', value: '<img src="${URL}" width="200px" height="200px" />' }
            ]
          }
        ]
      },
      {
        url: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/Accessibility/MapServer',
        id: 'Accessibility'
      }
    ],
    mapTypes: [
      {
        label : 'Schematic',
        thumbnail : 'imgs/basemap-thumbnail-vt.jpg',

        // 180831 LW: No apparent https access to gisservices.blacksburg.gov/.../BASE_Map
        layerUrls : [
          'http://gisservices.blacksburg.gov/arcgis/rest/services/Map_Services/BASE_Map/MapServer',
          'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/Basemap/MapServer'
        ]
      },
      {
        label : 'Aerial Photo',
        thumbnail : 'imgs/basemap-thumbnail-imagery.jpg',
        layerUrls : [
          'https://birdseye.gis.vt.edu/arcgis/rest/services/pictometry2015_cached_web_mercator/MapServer'
        ]
      }
    ],
    markerSymbol: 'imgs/vt-marker.png',
    featuredPlaces : {
      'Ag Quad': { geometry : { lat : 37.225351, lng : -80.423796 } },
      'Burruss Hall': { geometry : { lat : 37.229054, lng : -80.423769 }, },
      'Cassell Coliseum': { geometry : { lat : 37.222537, lng : -80.419021 } },
      'Center for the Arts': { geometry : { lat : 37.231783, lng :-80.418371 } },
      'Cowgill Hall': { geometry : { lat : 37.229922, lng : -80.424688 } },
      'Derring Hall': { geometry : { lat : 37.228995, lng : -80.425622 } },
      'Dietrick Hall': { geometry : { lat : 37.224545, lng : -80.421081 } },
      'Drillfield': { geometry : { lat : 37.227429, lng : -80.42223 } },
      'Duck Pond': { geometry : { lat : 37.225941, lng : -80.428249 } },
      'Graduate Life Center': { geometry : { lat : 37.228272, lng : -80.417516 } },
      'Hahn Horticulture Garden': { geometry : { lat : 37.219414, lng : -80.424276 } },
      'Henderson Hall': { geometry : { lat : 37.230347, lng : -80.416911 } },
      'Inn at Virginia Tech & Skelton Conference Center': { geometry : { lat : 37.229782, lng : -80.429599 } },
      'Lane Stadium': { geometry : { lat : 37.219889, lng : -80.418098 } },
      'Lavery Hall': { geometry : { lat : 37.231212, lng : -80.422828 } },
      'Lee Hall': { geometry : { lat : 37.224503, lng : -80.418505 } },
      'McComas Hall': { geometry : { lat : 37.220246, lng : -80.422537 } },
      'Merryman Center': { geometry : { lat : 37.221544, lng : -80.419101 } },
      'Newman Library': { geometry : { lat : 37.228932, lng : -80.419217 } },
      'Owens Hall': { geometry : { lat : 37.226624, lng : -80.418956 } },
      'Parking Services': { geometry : { lat : 37.216069, lng : -80.418329 } },
      'Performing Arts Building': { geometry : { lat : 37.230637, lng : -80.420873 } },
      'Pylons': { geometry : { lat : 37.228909, lng : -80.420342 } },
      'Smithfield Plantation': { geometry : { lat : 37.217958, lng : -80.432142 } },
      'Squires Student Center': { geometry : { lat : 37.229557, lng : -80.418021 } },
      'Student Services Building': { geometry : { lat : 37.222099, lng : -80.421803 } },
      'Theatre 101': { geometry : { lat : 37.230269, lng : -80.416352 } },
      'Veterinary Teaching Hospital': { geometry : { lat : 37.217624, lng : -80.427927 } },
    },
    spatialReference: { wkid: 102100 },
    gazeteerLayerUrl: 'https://arcgis-central.gis.vt.edu/arcgis/rest/services/vtcampusmap/VTPlaceNames/MapServer/0'
  };
});
