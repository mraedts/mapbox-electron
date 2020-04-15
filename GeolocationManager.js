const io = require('socket.io-client');

const routeLineCasing = {
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
};

const routeLine = {
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
};

class GeolocationManager {
  constructor(geolocateControl, mapBoxDirections, map, document) {
    this.geolocateControl = geolocateControl;
    this.mapBoxDirections = mapBoxDirections;
    this.document = document;
    this.notifyDirectionsFuncs = [];

    this.instructionSteps;
    this.nextStepIndex = 1;
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

    this.socket.on('directions', (data) => {
      //set destination and origin

      console.log(data);
      mapBoxDirections.setDirectionsFromBle(data);
      this.applyToMap(data);

      this.instructionSteps = this.document.querySelectorAll(
        '.mapbox-directions-step'
      );

      if (directionsManager != undefined) {
        directionsManager.setSteps(this.instructionSteps);
      }
    });
  }

  applyToMap(data) {
    const map = this.map;

    if (map.isSourceLoaded('route')) {
      map.removeLayer('route-line-casing');
      map.removeLayer('route-line');
      map.removeSource('route');
    }

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
    map.addLayer(routeLineCasing);
    map.addLayer(routeLine);
  }

  setPosition(position) {
    this.position = position;
    this.map.setBearing(position.coords.bearing);
    this.geolocateControl._updateMarker(position);
  }

  getPosition() {
    return this.position;
  }
}

module.exports = GeolocationManager;
