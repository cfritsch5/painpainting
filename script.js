document.addEventListener("DOMContentLoaded", function() {

// set up canvas(es)
  let backgroundcanvas = document.getElementById('backgroundcanvas');
  let backgroundcntx = backgroundcanvas.getContext("2d");
  let canvas = document.getElementById('canvas');
  let cntx = canvas.getContext("2d");
  let legendcanvas = document.getElementById('legendcanvas');
  let legendcntx = legendcanvas.getContext("2d");
  let isPainting = false;

// set up variables to store current path and drawing history
  let path = [];
  let imgdata = [cntx.getImageData(0,0,canvas.width, canvas.height)];
  let makebetter = new Image();
  let makesworse = new Image();
  makebetter.src = `images/makebetter.png`;
  makesworse.src = `images/makesworse.png`;

// initializing line style, function, & listeners
  cntx.lineCap = 'round';
  cntx.lineJoin = "round";
  cntx.lineWidth = 15;
  let currentcolor = "red";
  let lineWidth = document.getElementById('lineWidth');
  let intensity = document.getElementById('intensity');
  let linesize = document.getElementById("linesize");
  function color() {
    if (currentcolor === "red") { return `rgb(255, ${ 255 * (1-intensity.value)}, ${255 * (1-intensity.value)} )`};
    if (currentcolor === "erase") {return "rgba(255,255,255)"};
  } 

  function updateLinesize(newColor){
    if (newColor) { currentcolor = newColor}
    cntx.lineWidth = lineWidth.value;
    cntx.strokeStyle = color();
    linesize.style = `background-color: ${color()}; width:${lineWidth.value}px; height:${lineWidth.value}px;`;
  };

  cntx.strokeStyle = color();
  lineWidth.addEventListener("input", (e) => { updateLinesize(); });
  intensity.addEventListener("input", (e) => { updateLinesize(); });



// draw background body outline
  let img = document.getElementById('bodyoutline');
  img.addEventListener('load', (e) => {
    backgroundcntx.drawImage(img, 0, 0,canvas.width, canvas.height); 
  });

  // initialize trigger types object
  let triggers = {
    heat: {heat: 'heat'},
    cold: {cold:'cold'},
    touch: {touch:'touch'},
    movement: {movement:'movement'},
    custom: {custom:'custom'}
  };

  //set up trigger event listeners, radio options, and images
  //set up triggers object and elements 
  for (let key in triggers) {
    triggers[key].icon = new Image();
    triggers[key].icon.src = `images/${key}icon.png`;
    triggers[key].element = document.getElementById(key);
    triggers[key].radio = triggers[key].element.nextElementSibling;
    triggers[key].radiobetter = document.getElementById(`${key}better`);
    triggers[key].radioworse = document.getElementById(`${key}worse`);
    triggers[key].radioworse.addEventListener('change', ()=>{
      if (triggers[key].radioworse.checked) {
        // console.log(key, 'better',triggers[key].radiobetter.checked, 'worse',triggers[key].radioworse.checked,);
      }
    });
    triggers[key].radiobetter.addEventListener('change', ()=>{
      if (triggers[key].radiobetter.checked){
        // console.log(key, 'better',triggers[key].radiobetter.checked, 'worse',triggers[key].radioworse.checked,);
      } 
    });
    triggers[key].element.addEventListener('click', ()=>{
      if ( triggers[key].element.checked){
        triggers[key].radio.style.display = 'contents';
      } else {
        triggers[key].radio.style.display = 'none';
      };
    });
  }; //end of for key in triggers loop

  let triggerbutton = document.getElementById('trigger');
  let triggertypebox = document.getElementById("triggertypes");

  triggerbutton.addEventListener('click', (e) => {
    canvas.removeEventListener("touchstart",onStart);
    canvas.removeEventListener("mousedown",onStart);
    
    canvas.addEventListener('mousedown', drawtrigger);
    canvas.addEventListener('touchstart', drawtrigger);
    canvas.addEventListener("mouseup", triggerstamp);
    canvas.addEventListener("touchend", triggerstamp);

    triggertypebox.style.display = "flex"; //to make it not hidden
    triggerbutton.style.display = "none";
  });

  //close triggers
  let hidetriggers = document.getElementById('closetrigger');
  function closetriggers() {
    triggertypebox.style = 'display: none';
    triggerbutton.style.display = "initial";

    canvas.removeEventListener("mouseup", triggerstamp);
    canvas.removeEventListener("touchend", triggerstamp);
    canvas.removeEventListener('mousedown', drawtrigger);
    canvas.removeEventListener('touchstart', drawtrigger);
    canvas.addEventListener("mousedown",onStart);
    canvas.addEventListener("touchstart",onStart);

    cntx.lineWidth = lineWidth.value;
    cntx.strokeStyle = `rgb(255, 0, 0, ${intensity.value})`;

    for (let key in triggers) {
      triggers[key].radio.style.display = 'none';
      triggers[key].element.checked = false;
    }
  }
  hidetriggers.addEventListener('click',()=>{
   closetriggers();
  })

  //show & hide instructions
  let instructions = document.getElementById('showinstructiondisplay');
  let instructionsbutton = document.getElementById('showinstructionsbutton');
  instructionsbutton.addEventListener('click', ()=>{
    instructions.style = 'display: contents';
    instructionsbutton.style = 'display: none;'
  });
  let hidebutton = document.getElementById('hideinstructions');
  hidebutton.addEventListener('click',()=>{
    instructions.style = 'display: none';
    instructionsbutton.style = 'display: initial;'
  })

// action controls
// UNDO
  let undo = document.getElementById('undo');
  undo.addEventListener('click', (e) => {
    if (imgdata.length > 1) {
      cntx.clearRect(0,0,canvas.width,canvas.height);
      imgdata.pop();
      cntx.putImageData(imgdata.at(-1),0,0);
    }
  });

// CLEAR
    let clearbutton = document.getElementById('clear');
    clearbutton.addEventListener("click", () => {
      imgdata = [imgdata[0]];
      legendcntx.clearRect(0,0,canvas.width,canvas.height);
      cntx.clearRect(0,0,canvas.width,canvas.height);
    });

//SAVE
  let savebutton = document.getElementById('savebutton');
  savebutton.addEventListener("click", () => {
    backgroundcntx.globalAlpha = 0.9;
    backgroundcntx.drawImage(canvas,0,0);
    backgroundcntx.drawImage(legendcanvas,0,0);
    const link = document.createElement("a"); // a referes to the type of element created aka <a href> link element
    link.download = "PainPaintingImage.png";
    link.href = backgroundcanvas.toDataURL();
    backgroundcntx.globalAlpha = 1; 
    backgroundcntx.drawImage(img, 0, 0,canvas.width, canvas.height); //redraw to clear background img
    link.click();
  });

  //ERASE 
  let erasebutton = document.getElementById('erase');
  erasebutton.addEventListener("click", ()=>{
    if (erasebutton.checked) {
      cntx.globalCompositeOperation = "destination-out";  
      updateLinesize("erase");
      intensity.disabled = true;
    } else {
      cntx.lineWidth = lineWidth.value;
      cntx.globalCompositeOperation = "source-over";  
      updateLinesize("red");
      intensity.disabled = false;
    }

  });

// main drawing process listeners and functions
  canvas.addEventListener("mousedown",onStart);
  canvas.addEventListener("touchstart",onStart);
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("touchmove", onMove);
  canvas.addEventListener("mouseup", onEnd);
  canvas.addEventListener("touchend", onEnd);
  canvas.addEventListener("mouseout", onEnd);
  
  function drawPath() {
    cntx.moveTo(...path[0]);
    cntx.beginPath();
    for (var point in path) {
      cntx.lineTo(...path[point]);
    }
    cntx.stroke();
  }

  function onStart(e) {
    isPainting = true;
    path.push([e.offsetX,e.offsetY],[e.offsetX,e.offsetY]); //two points are needed to make canvas's stroke show up for first point
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
  //end of main drawing functions

  //drawing triggers functions
  function drawtrigger(e) {
    legendcntx.lineWidth = 1;
    legendcntx.strokeStyle = `rgb(0, 0, 0, 1)`;
    path.push([e.offsetX,e.offsetY]);
  }

  function vectorizePath(A,B,offset) {
    let d = Math.sqrt(Math.pow(B[0]-A[0],2)+ Math.pow(B[1]-A[1],2));
    let u = [(B[0]-A[0])/d, (B[1]-A[1])/d];
    return [B[0]+offset*u[0],B[1]+offset*u[1]];
  }

  function triggerstamp(e) {
    path.push([e.offsetX,e.offsetY]);
    let A = path[0];
    let B = path[1];
    let offset = 20;
    let v = vectorizePath(A,B,offset);

    legendcntx.lineTo(e.offsetX,e.offsetY);
    legendcntx.beginPath();
    legendcntx.moveTo(A[0],A[1]);
    legendcntx.lineTo(B[0],B[1]);
    legendcntx.stroke();
    let radius = 10;
    legendcntx.moveTo(v[0]+radius,v[1]);
    let triggerspacing = 0;
    for (let key in triggers){
      if (triggers[key][key]=== 'custom' && triggers[key].element.checked) {        
        legendcntx.font = "16px Arial";
        legendcntx.fillText(document.getElementById('customtext').value, v[0]-13.5+triggerspacing,v[1]-13.5)
      } else {
        if(triggers[key].element.checked) {

          legendcntx.drawImage(triggers[key].icon, v[0]-13.5+triggerspacing,v[1]-13.5,25,25);
          triggerspacing = triggerspacing + offset;

          if (triggers[key].radiobetter.checked) {
            legendcntx.drawImage(makebetter, v[0]+triggerspacing-36,v[1]-12,40,40);
          } else if (triggers[key].radioworse.checked) {
            legendcntx.drawImage(makesworse, v[0]+triggerspacing-36,v[1]-12,40,40);
          }
        } 
          
      };
    };

    legendcntx.stroke();
    path = [];

    imgdata.push(cntx.getImageData(0,0,canvas.width, canvas.height));

    closetriggers();
  }

})
