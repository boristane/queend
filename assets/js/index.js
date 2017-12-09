var metOfficeKey = "a021fe67-358e-4f43-8e67-4aa39ee59c37";
var allAvailableObsURL = "http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/capabilities?res=hourly&key=" + metOfficeKey;
var latestObsTime = "";
var stations = [];
var data;

// Get the latest available time wind observations are available
ajaxGet(allAvailableObsURL, function(response){
    data = JSON.parse(response);
    var obsTimes = data.Resource.TimeSteps.TS;
    latestObsTime = obsTimes[obsTimes.length-1];
    var obsURL = "http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/json/all?res=hourly&time=" + latestObsTime + "&key=" + metOfficeKey;
    // Get the current wind data at each station
    ajaxGet(obsURL, function(response2){
        data = JSON.parse(response2);
        var nbrStation = data.SiteRep.DV.Location.length;
        for(var i = 0; i < nbrStation; i++){
            var locationDetails = data.SiteRep.DV.Location[i];
            var windData = data.SiteRep.DV.Location[i].Period.Rep;
            var station = {}; 
            station.windSpeed = parseFloat(windData.S, 10);
            if(isNaN(station.windSpeed)){
                continue;
            }
            station.id = locationDetails.i;
            station.name = locationDetails.name.toLowerCase();
            station.lon = parseFloat(locationDetails.lon, 10);
            station.lat = parseFloat(locationDetails.lat, 10);
            station.windDirection = parseWindDirection(windData.D);
            var cartWindSpeed = pol2car(station.windSpeed, station.windDirection);
            station.wx = cartWindSpeed.wx;
            station.wy = cartWindSpeed.wy;

            // Convert lat/lon into British National Grid
            var point = new LatLon(station.lat, station.lon);
            var grid = OsGridRef.latLonToOsGrid(point);
            station.x = grid.easting;
            station.y = grid.northing;
            
            var coord = bngToPixels(station.x, station.y);
            drawCoordinates(coord.x, coord.y);
            write(station.name, coord.x+5, coord.y+5);

            stations.push(station);
        }
        
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

function deg2rad(deg){
    return deg*Math.PI/180;
}