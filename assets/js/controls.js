
var cities = [];
var London = {
    name: "London (scaled down)",
    pop: 2.074,
    lon: -0.118092,
    lat: 51.509865
};
cities.push(London);

var Birmingham = {
    name: "Birmingham",
    pop: 1.020,
    lon: -1.898575,
    lat: 52.489471
};
cities.push(Birmingham);

var Leeds = {
    name: "Leeds",
    pop: 0.726,
    lon: -1.548567,
    lat: 53.801277
};
cities.push(Leeds);

var Glasgow = {
    name: "Glasgow",
    pop: 0.616,
    lon: -4.296141,
    lat: 55.859238
};
cities.push(Glasgow);

var Sheffield = {
    name: "Sheffield",
    pop: 0.530,
    lon: -1.464795,
    lat: 53.383055
};
cities.push(Sheffield);

var Bradford = {
    name: "Bradford",
    pop: 0.483,
    lon: -1.75206,
    lat: 53.79391
};
cities.push(Bradford);

var Liverpool = {
    name: "Liverpool",
    pop: 0.467,
    lon: -2.97794,
    lat: 53.41058
};
cities.push(Liverpool);

var Edinburgh = {
    name: "Edinburgh",
    pop: 0.448,
    lon: -3.188267,
    lat: 55.953251
};
cities.push(Edinburgh);

var Manchester = {
    name: "Manchester",
    pop: 0.430,
    lon: -2.24644,
    lat: 53.483959
};
cities.push(Manchester);

var Bristol = {
    name: "Bristol",
    pop: 0.399,
    lon: -2.587910,
    lat: 51.454514
};
cities.push(Bristol);


var form = document.querySelector("form");
var metStations = document.getElementById("metStations");
var majorCities = document.getElementById("majorCities");

form.addEventListener("submit", function(e){
    e.preventDefault();
});

metStations.addEventListener("change",function(){
    if(this.checked) {
        for(var i=0; i<stations.length; i++){
            var coord = bngToPixels(stations[i].x, stations[i].y);
            var color = "red";
            var scale = 2;
            drawCoordinates(coord.x, coord.y, scale, color);
            //makeBase(bodyWidth, bodyHeight);
        }
    }

    if(!this.checked) {
        drawResult();
    }
    
});

majorCities.addEventListener("change",function(){
    if(this.checked) {
        for(var i=0; i<cities.length; i++){
            var city = cities[i];
            var point = new LatLon(city.lat, city.lon);
            var foo = OsGridRef.latLonToOsGrid(point);
            var coord = bngToPixels(foo.easting, foo.northing);
            var color = "rgba(0,0,0,0.6)";
            var scale = 15*city.pop;
            drawCoordinates(coord.x, coord.y, scale, color);

            var cityFont = "10px Helvetica";
            var textColor = "rgb(0, 0, 0)";
            write(city.name, coord.x+10*city.pop, coord.y+10*city.pop, cityFont, textColor);
        }
    }

    if(!this.checked) {
        drawResult();
    }
});


function drawResult(){
    initialiseCanvas(bodyWidth, bodyHeight);
    for(var j=0; j<interpGrid.length; j++){
        var interpPoint = interpGrid[j];
        var interpCoord = bngToPixels(interpPoint.x, interpPoint.y);
        var pol = car2pot(interpPoint.wx, interpPoint.wy);
        var windColor = setWindColor(pol.r);
        var scale = 4;
        drawLine(canvas, interpCoord.x, interpCoord.y, interpPoint.wx, interpPoint.wy, scale, "rgba("+ windColor + ", 1.0)");
    }
    makeBase(bodyWidth, bodyHeight);
}

var buttonUp = document.getElementById("arrow-up");
var buttonDown = document.getElementById("arrow-down");

buttonUp.addEventListener("click", function(){
    obsTimeCount++;
    if(obsTimeCount >= obsTimes.length){
        obsTimeCount = obsTimes.length-1;
        return;
    }
    makeWindMap(obsTimes[obsTimeCount]);
    displayDate(obsTimes[obsTimeCount]);
    metStations.checked = false;
    majorCities.checked = false;
});

buttonDown.addEventListener("click", function(){
    obsTimeCount--;
    if(obsTimeCount < 0){
        obsTimeCount = 0;
        return;
    }
    makeWindMap(obsTimes[obsTimeCount]);
    displayDate(obsTimes[obsTimeCount]);
    metStations.checked = false;
    majorCities.checked = false;
});

// Source: https://stackoverflow.com/questions/12796513/html5-canvas-to-png-file
function dlCanvas() {

    var dlElt = document.getElementById("dl");
    dlElt.setAttribute("download", latestObsTime+".png");
    var dateFont = (bodyWidth/45).toString()+ "px Helvetica";
    var textColor = "rgb(133, 133, 133)";
    //write(latestObsTime, bodyWidth*(1-1/4), bodyHeight*(1-1/15), dateFont, textColor);

    var dt = canvas.toDataURL('image/png');
    /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
    dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
  
    /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
    dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');
  
    this.href = dt;
    makeBase(bodyWidth, bodyHeight);
}

document.getElementById("dl").addEventListener("click", dlCanvas, false);