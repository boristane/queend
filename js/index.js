const url = 'https://local-weather-boristane.herokuapp.com/queend';
let filename = '';

const imgWidth = 1654;
const imgHeight = 2423;
initialiseCanvas(document.getElementById('canvas'), imgWidth, imgHeight);

// Get the latest available time wind observations are available
fetch(url).
    then((res) => res.json()).
    then((data) => {
        const canvas = document.getElementById('canvas');
        const obsTimes = data;
        makeWindMap(canvas, obsTimes);
    });

function makeWindMap(canvas, obsTimes){
    const obsTime = obsTimes[obsTimes.length - 1];
    filename = obsTime;
    // Get the current wind data at each station
    postData(url, {obsTime}).
        then((data) => {
            const stations = [];
            const nbrStation = data.length;
            for(let i = 0; i < nbrStation; i++){
                const locationDetails = data[i];
                const windData = data[i].Period.Rep;
                const station = {};
                if (isNaN(parseFloat(windData.S, 10))) {
                    continue;
                }
                station.windSpeed = mph2ms(parseFloat(windData.S, 10));
                station.id = locationDetails.i;
                station.name = locationDetails.name.toLowerCase();
                station.lon = parseFloat(locationDetails.lon, 10);
                station.lat = parseFloat(locationDetails.lat, 10);
                station.country = locationDetails.country.toLowerCase();
                station.windDirection = parseWindDirection(windData.D);
                const cartWindSpeed = pol2car(station.windSpeed, station.windDirection);
                station.wx = cartWindSpeed.wx;
                station.wy = cartWindSpeed.wy;

                // Convert lat/lon into British National Grid
                const point = new LatLon(station.lat, station.lon);
                const grid = OsGridRef.latLonToOsGrid(point);
                station.x = grid.easting;
                station.y = grid.northing;

                stations.push(station);
            }
            
            
            const MAX_EASTING = 669253;
            const MAX_NORTHING = 984594;
            const STEP = 12000;

            const model = 'exponential';
            const sigma2 = 0;
            const alpha = 100;

            const x = stations.map((station) => station.x);
            const y = stations.map((station) => station.y);
            const wx = stations.map((station) => station.wx);
            const wy = stations.map((station) => station.wy);

            const fitModelWx = kriging.train(wx, x, y, model, sigma2, alpha);
            const fitModelWy = kriging.train(wy, x, y, model, sigma2, alpha);
            
            for (let i = 0; i < MAX_EASTING; i += STEP){
                for (let j=0; j<MAX_NORTHING; j += STEP){
                    const interpPoint = {};
                    interpPoint.x = i;
                    interpPoint.y = j;
                    interpPoint.wx = kriging.predict(i,j,fitModelWx);
                    interpPoint.wy = kriging.predict(i,j,fitModelWy);
                    const interpCoord = bngToPixels(canvas, i, j);
                    const pol = car2pot(interpPoint.wx, interpPoint.wy);
                    const windColor = setWindColor(pol.r);
                    const scale = 10;
                    drawLine(canvas, interpCoord.x, interpCoord.y, interpPoint.wx, interpPoint.wy, scale, windColor);
                    drawCoordinates(canvas, interpCoord.x, interpCoord.y, 3, windColor);
                }
            }
            makeBase(canvas, imgWidth, imgHeight, drawLegend, obsTime);
        });
}

function drawLegend (time) {
    const canvas = document.getElementById('canvas');
    const speeds = [
        0,
        4,
        6,
        8,
        10
    ];
    const {width, height} = canvas;
    
    write(canvas, 'data source: ', width - 350, 55, '40px Helvetica', 'black');
    const metOfficeLogo = document.getElementById('met-office-logo');
    canvas.getContext('2d').drawImage(metOfficeLogo, width - 120, height - 120, 100, 100);
    
    write(canvas, new Date(time).toString(), 10, height - 60, '50px Helvetica', 'black');
    write(canvas, 'wind speeds', width - 335, height - 150, '50px Helvetica', 'black');
    speeds.forEach((speed, index) => {
        // eslint-disable-next-line no-mixed-operators
        drawLine(canvas, width - 320, height - (index * 60 + 200), 80, 0, 1, setWindColor(speed + 0.1));
        // eslint-disable-next-line no-mixed-operators
        write(canvas, `> ${speed} m/s`, width - 210, height - (index * 60 + 215), '40px Helvetica', 'black');
    });
}

function drawCoordinates (canvas, x, y, scale,color) {
    const pointSize = scale; 
    const ctx = canvas.getContext('2d');
    y = canvas.height - y;
    ctx.fillStyle = color; 
    ctx.beginPath(); 
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true); 
    ctx.fill(); 
}

function write (canvas, s, x, y, font, color) {
    y = canvas.height - y;
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
}

function drawLine (canvas, x0, y0, wx, wy, scale, color) {
    const ctx = canvas.getContext('2d');
    y0 = canvas.height - y0;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    wx = scale*wx + x0;
    wy = scale*wy + y0;
    ctx.lineWidth = 3;
    ctx.lineTo(wx, wy);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function makeBase (canvas, width, height, cb, time) {
    const ctx = canvas.getContext('2d');
    const baseImage = new Image();
    baseImage.src = './img/map-borders.png';
    baseImage.onload = function(){
        ctx.drawImage(baseImage, 0, 0, width, height);
        cb(time);
    };
}

function initialiseCanvas (canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
}

// Convert from British National Grid to Pixels for the canvas
function bngToPixels (canvas, x, y) {
    const result = {};
    result.x = x*canvas.width/700000;
    result.y = y*canvas.width/700000;
    return result;
}

function parseWindDirection (s) {
    let windDirection = 0;
    switch (s) {
        case 'N':
            windDirection = 0;
            break;
        case 'NNE':
            windDirection = 22.5;
            break;
        case 'NE':
            windDirection = 45;
            break;
        case 'ENE':
            windDirection = 67.5;
            break;
        case 'E':
            windDirection = 90;
            break;
        case 'ESE':
            windDirection = 112.5;
            break;
         case 'SE':
            windDirection = 135;
            break;
        case 'SSE':
            windDirection = 157.5;
            break;
        case 'S':
            windDirection = 180;
            break;
        case 'SSW':
            windDirection = 202.5;
            break;
        case 'SW':
            windDirection = 225;
            break;
        case 'WSW':
            windDirection = 247.5;
            break;
         case 'W':
            windDirection = 270;
            break;
        case 'WNW':
            windDirection = 292.5;
            break;
        case 'NW':
            windDirection = 315;
            break;
        case 'NNW':
            windDirection = 337.5;
            break;
        default:
            windDirection = 0;
    }
    return windDirection;
}

function pol2car (r, theta) {
    const cart = {};
    cart.wx = -r*Math.sin(deg2rad(theta));
    cart.wy = r*Math.cos(deg2rad(theta));
    return cart;
}

function car2pot (xx,yy) {
    const pol = {};
    pol.r = Math.sqrt(Math.pow(xx,2) + Math.pow(yy,2));
    pol.theta = Math.atan2(xx,yy);
    return pol;
}

function deg2rad (deg) {
    return deg*Math.PI/180;
}

function setWindColor (r) {
    let rgbCode = '';
    if(r < 4){
        rgbCode = '0, 204, 0';
    }
    if(r > 4){
        rgbCode = '153, 204, 0';
    }
    if(r > 6){
        rgbCode = '255, 255, 102';
    }
    if(r > 8){
        rgbCode = '255, 102, 0';
    }
    if(r > 10){
        rgbCode = '255, 0, 0';
    }
    return `rgb(${rgbCode})`;
}

function mph2ms (mph) {
    return mph*0.44704;
}

function postData(url = '', data = {}) {
    return fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify(data)
    }).
    then((response) => response.json());
  }

// Source: https://stackoverflow.com/questions/12796513/html5-canvas-to-png-file
function dlCanvas () {

    const dlElt = document.getElementById('dl');
    dlElt.setAttribute('download', `${filename}.png`);

    let dt = canvas.toDataURL('image/png');

    /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
    dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
  
    /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
    dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');
  
    this.href = dt;
}

document.getElementById('dl').addEventListener('click', dlCanvas, false);