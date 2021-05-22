let app = new Vue({
  el: "#application",
  data: {
    latitude: undefined,
    longitude: undefined,
    location: {},
    loaded: false,
    forecast: {},
    polution: undefined
  },
  methods: {
    format(temp) {
      return Math.round(temp - 273.15) + " °C";
    },
    getDateFromTimestamp(timestamp) {
      return new Date((timestamp + app.forecast.timezone_offset) * 1e3);
    },
    setLocation() {
      if (!navigator.geolocation) {
        alert("GPS not avalable");
      } else {
        navigator.geolocation.getCurrentPosition(function sucsess(loc) {
          app.longitude = loc.coords.longitude;
          app.latitude = loc.coords.latitude;

          Cookies.set("lon", app.longitude, {
            sameSite: "strict"
          });
          Cookies.set("lat", app.latitude, {
            sameSite: "strict"
          });

          console.log(loc.coords.longitude + " " + loc.coords.latitude);
          refresh();
        }, function error() {
          alert("Could not get location.");
          app.setLocation();
        }, {
          enableHighAccuracy: false
        });
      }
    },
    formatAqi(aqi) {
      switch (aqi) {
        case 1:
          return "Good";
          break;
        case 2:
          return "Fair";
          break;
        case 3:
          return "Moderate";
          break;
        case 4:
          return "Poor";
          break;
        case 5:
          return "Very poor";
          break;
        default:
          return "N/A";
          break;
      }
    }
  }
})

async function get(requestPath) {
  let options = {
    method: 'GET',
  };
  let resp = await fetch(requestPath, options);
  console.log(resp);
  return resp.json();
}

(function() {
  console.log("Started, querring api");
  app.setLocation();
  if (Cookies.get("lat") == undefined || Cookies.get("lon") == undefined) {
    app.setLocation();
  } else {
    app.longitude = Cookies.get("lon");
    app.latitude = Cookies.get("lat");
  }

  refresh();
})();

function refresh() {
  app.longitude = Cookies.get("lon");
  app.latitude = Cookies.get("lat");
  get("https://api.lukeonuke.com/weather?lat=" + app.latitude + "&lon=" + app.longitude).then(response => {

    console.log("Got querry response");
    app.forecast = response;
    get("https://api.lukeonuke.com/map?lat=" + app.latitude + "&lon=" + app.longitude).then((locationResponse) => {
      app.location = locationResponse;
      console.log(app.location);
      app.loaded = true;
    });
    get("https://api.lukeonuke.com/pollution?lat=" + app.latitude + "&lon=" + app.longitude).then((airPolution) => {
      app.polution = airPolution;
    });
  });
}
