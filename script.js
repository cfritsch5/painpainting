document.addEventListener("DOMContentLoaded", function() {

// set up canvas
  let canvas = document.getElementById('canvas');
  let cntx = canvas.getContext("2d");
  let isPainting = false;

// set up variables to store current path and drawing history
  let path = [];
  let imgdata = [];

// initializing line style
  cntx.lineCap = 'round';
  cntx.lineWidth = 15;
  cntx.lineJoin = "round";
  cntx.strokeStyle = `rgb(255, 0, 0, 0.5)`;

// toolbar listeners and functions
  // line style controls
  let lineIndicator = document.getElementById('linesize');
  let lineWidth = document.getElementById('lineWidth');
  lineWidth.addEventListener("input", (e) => {
    cntx.lineWidth = lineWidth.value;
    lineIndicator.style.height = `${lineWidth.value}px`;
    lineIndicator.style.width = `${lineWidth.value}px`;
  });

  let intensity = document.getElementById('intensity');
  intensity.addEventListener("input", (e) => {
    cntx.strokeStyle = `rgb(255, 0, 0, ${intensity.value})`;
    lineIndicator.style.opacity = intensity.value;
  });

// draw background body outline
  let img = document.getElementById('teethdiagram2');
  // let img = document.getElementById('outlineimg');
  img.addEventListener('load', (e) => {
      cntx.drawImage(img, 0, 0,canvas.width, canvas.height);
      imgdata.push(cntx.getImageData(0,0,canvas.width, canvas.height));
    });

// action controls
  let undo = document.getElementById('undo');
  undo.addEventListener('click', (e) => {
    if (imgdata.length > 1) {
      cntx.clearRect(0,0,canvas.width,canvas.height);
      imgdata.pop();
      cntx.putImageData(imgdata.at(-1),0,0);
    }
  });

    let clearbutton = document.getElementById('clear');
    clearbutton.addEventListener("click", () => {
      imgdata = [imgdata[0]];
      // cntx.putImageData(imgdata.at(-1),0,0);
      cntx.drawImage(img, 0, 0,canvas.width, canvas.height);
    });

  let savebutton = document.getElementById('savebutton');
  savebutton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = canvas.toDataURL();
    link.click();
  });

// main drawing process listeners and functions
  canvas.addEventListener("mousedown",onStart);
  canvas.addEventListener("touchstart",onStart);
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("touchmove", onMove);
  canvas.addEventListener("mouseup", onEnd);
  canvas.addEventListener("touchend", onEnd);
  canvas.addEventListener("mouseout", onEnd);

  function onStart(e) {
    isPainting = true;
    path.push([e.offsetX,e.offsetY],[e.offsetX,e.offsetY]);
    //two points needed to make canvas's stroke show up
    drawPath();
  }

  function onMove(e) {
    if (isPainting === true) {
      path.push([e.offsetX,e.offsetY]);
      cntx.clearRect(0,0,canvas.width,canvas.height)
      cntx.putImageData(imgdata.at(-1),0,0);
      drawPath();
    }
  }

  function onEnd() {
    if (isPainting === true) {
      isPainting = false;
      path = [];
      imgdata.push(cntx.getImageData(0,0,canvas.width, canvas.height));
    }
  }

  function drawPath() {
    cntx.moveTo(...path[0]);
    cntx.beginPath();
    for (var point in path) {
      cntx.lineTo(...path[point]);
    }
    cntx.stroke();
  }

})
