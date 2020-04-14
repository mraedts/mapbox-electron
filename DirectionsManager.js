class DirectionsManager {
  constructor(geolocationManager, document) {
    this.geolocationManager = geolocationManager;
    this.stepElements = document.querySelectorAll('.mapbox-directions-step');

    this.position;
    this.stepHeights = [];
    this.nextStepIndex = 1;
    this.arrivedAtNextStep = false;
    setInterval(() => this.getDistanceToNextStep(this), 500);
  }

  scrollToStep(index) {
    this.stepElements[0].parentNode.parentNode.parentNode.scrollBy({
      top: this.stepHeights[index] + 10,
      left: 0,
      behavior: 'smooth',
    });
  }

  createStepHeightArray(that) {
    if (that == undefined) {
      const stepElements = this.stepElements;
      const stepHeights = this.stepElements;
    } else {
    }

    const stepElements = that.stepElements;
    const stepHeights = that.stepElements;

    if (stepElements == undefined) return;
    if (stepElements.length == 0) return;
    for (let i = 0; i < stepElements; i++) {
      let previousTotalHeight = 0;
      for (let n = 0; n < i; n++) {
        previousTotalHeight = previousTotalHeight + stepElements[n];
      }
      stepHeights.push(previousTotalHeight);
    }
  }

  getDistanceToNextStep(that) {
    const {
      geolocationManager,
      stepElements,
      nextStepIndex,
      getDistance,
      updateStepElements,
      distanceString,
    } = that;

    if (stepElements.length == 0) {
      updateStepElements(that);
      that.createStepHeightArray(that);
    }
    const nextStep = stepElements[nextStepIndex];
    const stepLongitude = nextStep.dataset.lng;
    const stepLatitude = nextStep.dataset.lat;
    const currentPosition = geolocationManager.getPosition();
    // console.log(currentPosition);
    const distance = getDistance(
      currentPosition.coords.latitude,
      currentPosition.coords.longitude,
      stepLatitude,
      stepLongitude,
      that
    );
    console.log(nextStep);
    console.log(nextStep.querySelector('.mapbox-directions-step-distance'));
    nextStep.querySelector(
      '.mapbox-directions-step-distance'
    ).textContent = `${distanceString(distance)}`;
    this.checkIfStepIsPassed(distance, that);
  }

  checkIfStepIsPassed(distance, that) {
    // convert distance to m
    distance = distance * 1000;
    if (distance < 20) {
      that.arrivedAtNextStep = true;
    }

    if (that.arrivedAtNextStep == true && distance > 45) {
      that.nextStepIndex++;
      that.arrivedAtNextStep = false;
    }
  }

  updateStepElements(that) {
    that.stepElements = document.querySelectorAll('.mapbox-directions-step');
  }

  setPosition(position) {
    this.position = position;
  }

  distanceString(m) {
    m = m * 1000;
    if (m >= 100000) return (m / 1000).toFixed(0) + 'km';
    if (m >= 10000) return (m / 1000).toFixed(1) + 'km';
    if (m >= 100) return (m / 1000).toFixed(2) + 'km';
    return m.toFixed(0) + 'm';
  }

  getDistance(lat1, lon1, lat2, lon2, that) {
    const { deg2rad } = that;
    // Returns distance in kilometers
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

module.exports = DirectionsManager;

lng = 52.258229;
lat = 6.149042;
