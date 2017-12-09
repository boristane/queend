function drawCoordinates(x,y){
    var pointSize = 2; 
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    y = canvas.height - y;
    ctx.fillStyle = "#ff2626"; 
    ctx.beginPath(); 
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true); 
    ctx.fill(); 
}

function write(s, x, y){
    var canvas = document.getElementById("canvas");
    y = canvas.height - y;
    var ctx = canvas.getContext("2d");
    ctx.font = "10px Arial";
    ctx.fillStyle = "blue";
    ctx.fillText(s, x, y);
}

function drawLine(x0, y0, wx, wy, scale, color){
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    y0 = canvas.height - y0;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    wx = scale*wx + x0;
    wy = scale*wy + y0;
    ctx.lineTo(wx, wy);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function makeBase(width, height){
    var canvas = document.getElementById("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    var baseImage = new Image();
    baseImage.src = "assets/img/map.png";
    baseImage.onload = function(){
        ctx.drawImage(baseImage, 0, 0, width, height);
    };
}

// Convert from British National Grid to Pixels for the canvas
function bngToPixels(x, y){
    var result = {};
    var canvas = document.getElementById("canvas");
    result.x = x*canvas.width/700000;
    result.y = y*canvas.width/700000;
    return result;
}

var imgWidth = 1654;
var imgHeight = 2423;

makeBase(imgWidth/2, imgHeight/2);