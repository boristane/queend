var metOfficeKey = "a021fe67-358e-4f43-8e67-4aa39ee59c37";
var allAvailableObsURL = "http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/capabilities?res=hourly&key=" + metOfficeKey;
var latestObsTime = "";
var stations = [];
var wx = [];
var wy = [];
var x = [];
var y = [];
var interpGrid = [];
var data;

// Get the latest available time wind observations are available
ajaxGet(allAvailableObsURL, function(response){
    
    data = JSON.parse(response);
    var obsTimes = data.Resource.TimeSteps.TS;
    latestObsTime = obsTimes[obsTimes.length-1];
    var obsURL = "http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/all?res=hourly&time=" + latestObsTime + "&key=" + metOfficeKey;
    console.log(latestObsTime);
    // Get the current wind data at each station
    ajaxGet(obsURL, function(response2){
        data = JSON.parse(response2);
        var nbrStation = data.SiteRep.DV.Location.length;
        for(var i = 0; i < nbrStation; i++){
            var locationDetails = data.SiteRep.DV.Location[i];
            var windData = data.SiteRep.DV.Location[i].Period.Rep;
            var station = {};
            if(typeof windData.S === "undefined"){
                continue;
            }
            station.windSpeed = mph2ms(parseFloat(windData.S, 10));
            if(isNaN(station.windSpeed)){
                continue;
            }
            station.id = locationDetails.i;
            station.name = locationDetails.name.toLowerCase();
            station.lon = parseFloat(locationDetails.lon, 10);
            station.lat = parseFloat(locationDetails.lat, 10);
            station.country = locationDetails.country.toLowerCase();
            station.windDirection = parseWindDirection(windData.D);
            var cartWindSpeed = pol2car(station.windSpeed, station.windDirection);
            station.wx = cartWindSpeed.wx;
            station.wy = cartWindSpeed.wy;

            // Convert lat/lon into British National Grid
            var point = new LatLon(station.lat, station.lon);
            var grid = OsGridRef.latLonToOsGrid(point);
            station.x = grid.easting;
            station.y = grid.northing;

            stations.push(station);
            x.push(station.x);
            y.push(station.y);
            wx.push(station.wx);
            wy.push(station.wy);
            if(station.country === "england" || station.country === "scotland" || station.country === "wales"){
                var coord = bngToPixels(station.x, station.y);
            }
        }
        
        
        const MAX_EASTING = 669253;
        const MAX_NORTHING = 984594;

        var model = "exponential";
        var sigma2 = 0;
        var alpha = 100;
        var fitModelWx = kriging.train(wx, x, y, model, sigma2, alpha);
        var fitModelWy = kriging.train(wy, x, y, model, sigma2, alpha);
        for(var i = 0; i<MAX_EASTING; i+=10000){
            for(var j=0; j<MAX_NORTHING; j+=10000){
                var interpPoint = {};
                interpPoint.x = i;
                interpPoint.y = j;
                interpPoint.wx = kriging.predict(i,j,fitModelWx);
                interpPoint.wy = kriging.predict(i,j,fitModelWy);
                interpGrid.push(interpPoint);
                var interpCoord = bngToPixels(i, j);
                var pol = car2pot(interpPoint.wx, interpPoint.wy);
                var windColor = setWindColor(pol.r);
                var scale = 4;
                drawLine(canvas, interpCoord.x, interpCoord.y, interpPoint.wx, interpPoint.wy, scale, "rgba("+ windColor + ", 1.0)");
                drawCoordinates(interpCoord.x, interpCoord.y, 1, "rgba("+ windColor + ", 1.0)");
            }
        }
        makeBase(bodyWidth, bodyHeight);
        displayDate(latestObsTime);
    });
});

function parseWindDirection(s){
    var windDirection = 0;
    switch(s){
        case "N":
            windDirection = 0;
            break;
        case "NNE":
            windDirection = 22.5;
            break;
        case "NE":
            windDirection = 45;
            break;
        case "ENE":
            windDirection = 67.5;
            break;
        case "E":
            windDirection = 90;
            break;
        case "ESE":
            windDirection = 112.5;
            break;
         case "SE":
            windDirection = 135;
            break;
        case "SSE":
            windDirection = 157.5;
            break;
        case "S":
            windDirection = 180;
            break;
        case "SSW":
            windDirection = 202.5;
            break;
        case "SW":
            windDirection = 225;
            break;
        case "WSW":
            windDirection = 247.5;
            break;
         case "W":
            windDirection = 270;
            break;
        case "WNW":
            windDirection = 292.5;
            break;
        case "NW":
            windDirection = 315;
            break;
        case "NNW":
            windDirection = 337.5;
            break;
        default:
            windDirection = 0;
    }
    return windDirection;
}

function pol2car(r, theta){
    var cart = {};
    cart.wx = -r*Math.sin(deg2rad(theta));
    cart.wy = r*Math.cos(deg2rad(theta));
    return cart;
}

function car2pot(xx,yy){
    var pol = {};
    pol.r = Math.sqrt(Math.pow(xx,2) + Math.pow(yy,2));
    pol.theta = Math.atan2(xx,yy);
    return pol;
}

function deg2rad(deg){
    return deg*Math.PI/180;
}

function setWindColor(r){
    var rgbCode = "";
    if(r < 4){
        rgbCode = "0, 204, 0";
    }
    if(r > 4){
        rgbCode = "153, 204, 0";
    }
    if(r > 6){
        rgbCode = "255, 255, 102";
    }
    if(r > 8){
        rgbCode = "255, 102, 0";
    }
    if(r > 10){
        rgbCode = "255, 0, 0";
    }
    return rgbCode;
}

function mph2ms(mph){
    return mph*0.44704;
}