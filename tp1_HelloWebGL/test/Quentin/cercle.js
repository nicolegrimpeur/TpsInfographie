function circle()
{
    var canvas = document.getElementById("canvas1");
    var context = canvas.getContext("2d");
    context.beginPath();
    context.lineWidth="2";
    context.arc(30, 20, 10, 0, 2 * Math.PI);
    context.stroke();
}
function fillCircle()
{
    var canvas = document.getElementById("canvas1");
    var context = canvas.getContext("2d");
    context.beginPath();
    context.fillStyle="#FF4422"
    context.arc(44, 80, 40, 0, 2 * Math.PI);
    context.fill();
}

circle();
fillCircle();