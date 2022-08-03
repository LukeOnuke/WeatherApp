let app = new Vue({
    el: "#application",
    data: {
        latitude: undefined,
        longitude: undefined,
        location: {},
        loaded: false,
        forecast: {},
        polution: undefined,
        notifications: [],
        cookiePolicy: false,
        cookiePrefSet: false
    },
    methods: {
        format(temp) {
            return Math.round(temp - 273.15) + "°C";
        },
        getDateFromTimestamp(timestamp) {
            return new Date((timestamp + app.forecast.timezone_offset) * 1e3);
        },
        setLocation() {
            //app.addNotification("Pogger", "Poggers", "info");
            //https://ipapi.co/json/
            if (!navigator.geolocation) {
                // TODO: Add notif system
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
        },
        addNotification(text, title, notificationLevel) {
            app.notifications.push({ text: text, title: title, notificationLevel: notificationLevel });
        },
        cookiePolicySet(boolean) {
            app.cookiePolicy = boolean;
            localStorage.setItem("cookiePolicy", boolean);
            app.cookiePrefSet = true;
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
    console.log("Getting cookie policy " + localStorage.getItem("cookiePolicy"));
    if (localStorage.getItem("cookiePolicy") != undefined) {
        app.cookiePolicy = localStorage.getItem("cookiePolicy");
        app.cookiePrefSet = true;

        if (localStorage.getItem("cookiePolicy") == true) {
            gtag('js', new Date());

            gtag('config', 'G-9M0BTHRHQF');
        }
    }


    console.log("Started, querring api");
    if (Cookies.get("lat") == undefined || Cookies.get("lon") == undefined) {
        get("https://ipapi.co/json/").then(ipLocation => {
            Cookies.set("lon", ipLocation.longitude, {
                sameSite: "strict"
            });
            Cookies.set("lat", ipLocation.latitude, {
                sameSite: "strict"
            });
            app.longitude = Cookies.get("lon");
            app.latitude = Cookies.get("lat");
            refresh();
        });
    } else {
        refresh();
    }
})();

function refresh() {
    app.longitude = Cookies.get("lon");
    app.latitude = Cookies.get("lat");
    get("https://api.pequla.com/weather?lat=" + app.latitude + "&lon=" + app.longitude).then(response => {
        console.log("Got querry response");
        app.forecast = response;
        get("https://api.pequla.com/map?lat=" + app.latitude + "&lon=" + app.longitude).then((locationResponse) => {
            app.location = locationResponse;
            console.log(app.location);
            app.loaded = true;
        });
        get("https://api.pequla.com/pollution?lat=" + app.latitude + "&lon=" + app.longitude).then((airPolution) => {
            app.polution = airPolution;
        });
    });
}