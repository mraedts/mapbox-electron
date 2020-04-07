const io = require('socket.io-client');

class GeolocationManager {
  constructor(geolocateControl) {
    this.geolocateControl = geolocateControl;
    this.initSocketConn();
    this.position;
  }

  initSocketConn() {
    this.socket = io('http://192.168.3.29:3060');

    this.socket.on('connect', function () {
      console.log('connected to socket.io from within GeolocManager');
    });

    const geolocateControl = this.geolocateControl;

    this.socket.on('geolocationUpdate', function (data) {
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

  set position(position) {
    this.position = position;

    this.geolocateControl._updateMarker(position);
  }

  getPosition() {
    return this.position;
  }
}

module.exports = GeolocationManager;
