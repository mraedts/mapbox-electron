const io = require('socket.io-client');

const style = [
  {
    id: 'route-route-line-alt',
    type: 'line',
    source: 'route',
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#bbb',
      'line-width': 4,
    },
    filter: [
      'all',
      ['in', '$type', 'LineString'],
      ['in', 'route', 'alternate'],
    ],
  },
  {
    id: 'route-route-line-casing',
    type: 'line',
    source: 'route',
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#2d5f99',
      'line-width': 12,
    },
    filter: ['all', ['in', '$type', 'LineString'], ['in', 'route', 'selected']],
  },
  {
    id: 'route-route-line',
    type: 'line',
    source: 'route',
    layout: {
      'line-cap': 'butt',
      'line-join': 'round',
    },
    paint: {
      'line-color': {
        property: 'congestion',
        type: 'categorical',
        default: '#4882c5',
        stops: [
          ['unknown', '#4882c5'],
          ['low', '#4882c5'],
          ['moderate', '#f09a46'],
          ['heavy', '#e34341'],
          ['severe', '#8b2342'],
        ],
      },
      'line-width': 7,
    },
    filter: ['all', ['in', '$type', 'LineString'], ['in', 'route', 'selected']],
  },
  {
    id: 'route-hover-point-casing',
    type: 'circle',
    source: 'route',
    paint: {
      'circle-radius': 8,
      'circle-color': '#fff',
    },
    filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'hover']],
  },
  {
    id: 'route-hover-point',
    type: 'circle',
    source: 'route',
    paint: {
      'circle-radius': 6,
      'circle-color': '#3bb2d0',
    },
    filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'hover']],
  },
  {
    id: 'route-waypoint-point-casing',
    type: 'circle',
    source: 'route',
    paint: {
      'circle-radius': 8,
      'circle-color': '#fff',
    },
    filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'waypoint']],
  },
  {
    id: 'route-waypoint-point',
    type: 'circle',
    source: 'route',
    paint: {
      'circle-radius': 6,
      'circle-color': '#8a8bc9',
    },
    filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'waypoint']],
  },
  {
    id: 'route-origin-point',
    type: 'circle',
    source: 'route',
    paint: {
      'circle-radius': 18,
      'circle-color': '#3bb2d0',
    },
    filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'A']],
  },
  {
    id: 'route-origin-label',
    type: 'symbol',
    source: 'route',
    layout: {
      'text-field': 'A',
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#fff',
    },
    filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'A']],
  },
  {
    id: 'route-destination-point',
    type: 'circle',
    source: 'route',
    paint: {
      'circle-radius': 18,
      'circle-color': '#8a8bc9',
    },
    filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'B']],
  },
  {
    id: 'route-destination-label',
    type: 'symbol',
    source: 'route',
    layout: {
      'text-field': 'B',
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#fff',
    },
    filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'B']],
  },
];

class GeolocationManager {
  constructor(geolocateControl, mapBoxDirections, map) {
    this.geolocateControl = geolocateControl;
    this.mapBoxDirections = mapBoxDirections;
    this.map = map;
    this.initSocketConn();
    this.position;
  }

  initSocketConn() {
    this.socket = io('http://192.168.3.29:3060');
    this.socket.on('connect', function () {
      console.log('connected to socket.io from within GeolocManager');
    });

    this.setGeolocResponse();
    this.setDirectionsResponse();
  }

  setGeolocResponse() {
    const geolocateControl = this.geolocateControl;
    this.socket.on('geolocationUpdate', (data) => {
      console.log('geoloc update received');
      console.log(data);
      geolocateControl._updateMarker({
        timestamp: 1585,
        coords: {
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude,
          accuracy: data.accuracy,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
      });
    });
  }

  setDirectionsResponse() {
    const mapBoxDirections = this.mapBoxDirections;
    const map = this.map;
    this.socket.on('directions', (data) => {
      //set destination and origin
      console.log(data);
      mapBoxDirections.setDirectionsFromBle(data);

      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: JSON.parse(data).routes[0].geometry.coordinates,
          },
        },
      });

      map.addLayer({
        id: 'route-line-casing',
        type: 'line',
        source: 'route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#2d5f99',
          'line-width': 12,
        },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-cap': 'butt',
          'line-join': 'round',
        },
        paint: {
          'line-color': {
            property: 'congestion',
            type: 'categorical',
            default: '#4882c5',
            stops: [
              ['unknown', '#4882c5'],
              ['low', '#4882c5'],
              ['moderate', '#f09a46'],
              ['heavy', '#e34341'],
              ['severe', '#8b2342'],
            ],
          },
          'line-width': 7,
        },
      });
    });
  }

  set position(position) {
    this.position = position;

    this.geolocateControl._updateMarker(position);
  }

  getPosition() {
    return this.position;
  }
}

module.exports = GeolocationManager;
