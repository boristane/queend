var canvas = document.getElementById("canvas");


function drawCoordinates(x,y, scale,color){
    var pointSize = scale; 
    var ctx = canvas.getContext("2d");
    y = canvas.height - y;
    ctx.fillStyle = color; 
    ctx.beginPath(); 
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true); 
    ctx.fill(); 
}

function write(s, x, y, font, color){
    y = canvas.height - y;
    var ctx = canvas.getContext("2d");
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
}

function drawLine(canvas, x0, y0, wx, wy, scale, color){
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
    var ctx = canvas.getContext("2d");
    var baseImage = new Image();
    baseImage.src = "assets/img/map-borders.png";
    baseImage.onload = function(){
        ctx.drawImage(baseImage, 0, 0, width, height);
    };
}

function initialiseCanvas(width, height){
    canvas.width = width;
    canvas.height = height;
}

function displayDate(date){
    var dateElt = document.getElementById("date");
    dateElt.textContent = sparseDate(date);

    var timeElt = document.getElementById("time");
    timeElt.textContent = sparseTime(date);
}

// Convert from British National Grid to Pixels for the canvas
function bngToPixels(x, y){
    var result = {};
    result.x = x*canvas.width/700000;
    result.y = y*canvas.width/700000;
    return result;
}

function sparseDate(dateString){
    var s1 = dateString.split("T")[0];

    var date = s1.split("-");
    var month = "";
    switch(date[1]){
        case "1":
            month = "January";
            break;
        case "2":
            month = "February";
            break; 
        case "3":
            month = "March";
            break;
        case "4":
            month = "April";
            break;
        case "5":
            month = "May";
            break;
        case "6":
            month = "June";
            break;
        case "7":
            month = "July";
            break;
        case "8":
            month = "August";
            break;
        case "9":
            month = "September";
            break;
        case "10":
            month = "October";
            break;
        case "11":
            month = "November";
            break;
        case "12":
            month = "December";
            break;
        default:
            month = date[1];
    }

    return date[2] + " " + month + " " + date[0];
}

function sparseTime(dateString){
    var s1 = dateString.split("T")[1];
    return s1.split("Z")[0];
}

function drawLegend(){
    var legent1 = document.getElementById("legend1");
    var legent2 = document.getElementById("legend2");
    var legent3 = document.getElementById("legend3");
    var legent4 = document.getElementById("legend4");
    var legent5 = document.getElementById("legend5");

    drawLine(legend1, 20, 10, 40, 0, 1, "rgba(0, 204, 0, 1.0)");
    drawLine(legend2, 20, 10, 40, 0, 1, "rgba(153, 204, 0, 1.0)");
    drawLine(legend3, 20, 10, 40, 0, 1, "rgba(255, 255, 102, 1.0)");
    drawLine(legend4, 20, 10, 40, 0, 1, "rgba(255, 102, 0, 1.0)");
    drawLine(legend5, 20, 10, 40, 0, 1, "rgba(255, 0, 0, 1.0)");
}


var imgWidth = 1654;
var imgHeight = 2423;
initialiseCanvas(imgWidth/3, imgHeight/3);
drawLegend();