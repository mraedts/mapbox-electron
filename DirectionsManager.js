var events = require('events');

// @TODO
//          - render icons/dots at step locations, (example in index.html)
//

class DirectionsManager {
  constructor(geolocationManager, document) {
    this.geolocationManager = geolocationManager;
    this.stepElements = document.querySelectorAll('.mapbox-directions-step');
    this.position;
    this.stepHeights = [];
    this.nextStepIndex = 0;
    this.arrivedAtNextStep = false;
    this.setupStepButtons();

    setInterval(() => this.getDistanceToNextStep(this), 500);
  }

  renderStepPoints() {
    let i = 0;

    this.stepElements.forEach((step) => {
      map.addSource('point' + i, {
        type: 'geojson',
        data: {
          type: 'Point',
          coordinates: [step.dataset.lng, step.dataset.lat],
        },
      });
      map.addLayer({
        id: 'point' + i,
        source: 'point' + i,
        type: 'circle',
        paint: {
          'circle-radius': 3,
          'circle-color': '#FFFFFF',
        },
      });
      i++;
    });
  }

  renderCurrentStepPoint(previousIndex, context) {
    if (!context) context = this;

    map.setPaintProperty('point' + previousIndex, 'circle-radius', 3);
    map.setPaintProperty('point' + context.nextStepIndex, 'circle-radius', 5);
  }

  setupStepButtons() {
    const upButton = document.querySelector('#upbutton');
    const downButton = document.querySelector('#downbutton');
    const context = this;

    upButton.addEventListener('click', () => {
      if (context.nextStepIndex <= 0) return;
      const currentIndex = context.nextStepIndex;
      context.nextStepIndex--;
      this.renderCurrentStepPoint(currentIndex);
      this.scrollToStep(this.nextStepIndex, context);
      this.arrivedAtNextStep = false;
    });
    downButton.addEventListener('click', () => {
      if (context.nextStepIndex >= context.stepElements.length - 1) return;
      const currentIndex = context.nextStepIndex;
      context.nextStepIndex++;
      this.renderCurrentStepPoint(currentIndex);
      this.scrollToStep(this.nextStepIndex, context);
      this.arrivedAtNextStep = false;
    });
  }

  getStepHeights() {
    const { stepElements, stepHeights } = this;
    stepElements.forEach((step) => {
      stepHeights.push(step.clientHeight);
    });
  }

  setSteps(steps) {
    this.stepElements = steps;
    this.getStepHeights();
    this.renderStepPoints();
  }

  getScrollHeight(i, context) {
    let scrollHeight = 0;
    for (let n = 0; n < i; n++) {
      scrollHeight = scrollHeight + context.stepHeights[n];
    }
    return scrollHeight + 10;
    // this.stepElements[0].parentNode.parentNode.parentNode.scrollTop
  }

  scrollToStep(i, context) {
    context.stepElements[0].parentNode.parentNode.parentNode.scroll({
      top: context.getScrollHeight(i, context),
      left: 0,
      behavior: 'smooth',
    });
  }

  getDistanceToNextStep(context) {
    const {
      geolocationManager,
      stepElements,
      nextStepIndex,
      getDistance,
      updateStepElements,
      distanceString,
      checkIfStepIsPassed,
    } = context;

    if (stepElements.length == 0) {
      return;
    }

    const nextStep = stepElements[nextStepIndex];
    const stepLongitude = nextStep.dataset.lng;
    const stepLatitude = nextStep.dataset.lat;
    const currentPosition = geolocationManager.getPosition();
    if (currentPosition == undefined) return;
    // console.log(currentPosition);
    const distance = getDistance(
      currentPosition.coords.latitude,
      currentPosition.coords.longitude,
      stepLatitude,
      stepLongitude,
      context
    );
    //console.log(nextStep);
    //console.log(nextStep.querySelector('.mapbox-directions-step-distance'));
    nextStep.querySelector(
      '.mapbox-directions-step-distance'
    ).textContent = `${distanceString(distance)}`;
    checkIfStepIsPassed(distance, context);
  }

  checkIfStepIsPassed(distance, context) {
    const { arrivedAtNextStep, nextStepIndex } = context;
    // convert distance to m
    distance = distance * 1000;
    if (distance < 17.5) {
      context.arrivedAtNextStep = true;
    }

    if (arrivedAtNextStep == true && distance > 22.5) {
      const currentIndex = context.nextStepIndex;
      context.nextStepIndex++;
      context.renderCurrentStepPoint(currentIndex, context);
      context.scrollToStep(nextStepIndex + 1, context);
      context.arrivedAtNextStep = false;
    }
  }

  updateStepElements(context) {
    context.stepElements = document.querySelectorAll('.mapbox-directions-step');
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

  getDistance(lat1, lon1, lat2, lon2, context) {
    const { deg2rad } = context;
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
