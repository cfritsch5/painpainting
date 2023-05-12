document.addEventListener("DOMContentLoaded", function() {

// set up canvas(es)
  let backgroundcanvas = document.getElementById('backgroundcanvas');
  let canvas = document.getElementById('canvas');
  let cntx = canvas.getContext("2d");
  let backgroundcntx = backgroundcanvas.getContext("2d");
  let isPainting = false;
  let isErasing = false;

// set up variables to store current path and drawing history
  let path = [];
  let imgdata = [cntx.getImageData(0,0,canvas.width, canvas.height)];
  let makebetter = new Image();
  let makesworse = new Image();
  makebetter.src = `images/makebetter.png`;
  makesworse.src = `images/makesworse.png`;

// initializing line style
  cntx.lineCap = 'round';
  cntx.lineJoin = "round";
  cntx.lineWidth = 15;
  cntx.strokeStyle = `rgb(255, 0, 0, 0.5)`;

  // line style controls
  let lineWidth = document.getElementById('lineWidth');
  let intensity = document.getElementById('intensity');
  lineWidth.addEventListener("input", (e) => {cntx.lineWidth = lineWidth.value;});
  intensity.addEventListener("input", (e) => {cntx.strokeStyle = `rgb(255, 0, 0, ${intensity.value})`;});

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

  //set up triggers event listeners, radio options, and images
  let triggerbutton = document.getElementById('trigger');
  let triggertypebox = document.getElementById("triggertypes");

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
  };

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
      cntx.putImageData(imgdata.at(-1),0,0);
    });

//SAVE
  let savebutton = document.getElementById('savebutton');
  savebutton.addEventListener("click", () => {
    backgroundcntx.drawImage(canvas,0,0);
    const link = document.createElement("a");
    link.download = "PainPaintingImage.png";
    link.href = backgroundcanvas.toDataURL();
    link.click();
    backgroundcntx.drawImage(img, 0, 0,canvas.width, canvas.height); //redraw to clear background img
  });

  //ERASE 
  let erasebutton = document.getElementById('erase');
  erasebutton.addEventListener("click", ()=>{
    // cntx.strokeStyle = `rgb(255, 255, 255, 1)`;
    if (erasebutton.checked) {
      // isErasing = true;
      cntx.globalCompositeOperation = "destination-out";  
      cntx.strokeStyle = "rgba(255,255,255,1)";
      
    } else {

      cntx.lineWidth = lineWidth.value;
      cntx.globalCompositeOperation = "source-over";  
      cntx.strokeStyle = `rgb(255, 0, 0, ${intensity.value})`; //reset to regular painting
      // isErasing = false;
      // erasebutton.checked = "false";
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
      // if (isErasing === true) {
        // cntx.lineWidth = lineWidth.value;
        // cntx.globalCompositeOperation = "source-over";  
        // cntx.strokeStyle = `rgb(255, 0, 0, ${intensity.value})`; //reset to regular painting
        // isErasing = false;
      // }
      path = [];
      imgdata.push(cntx.getImageData(0,0,canvas.width, canvas.height));
    }
  }
  //end of main drawing functions

  //drawing triggers functions
  function drawtrigger(e) {
    cntx.lineWidth = 1;
    cntx.strokeStyle = `rgb(0, 0, 0, 1)`;
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

    cntx.lineTo(e.offsetX,e.offsetY);
    cntx.beginPath();
    cntx.moveTo(A[0],A[1]);
    cntx.lineTo(B[0],B[1]);
    cntx.stroke();
    let radius = 10;
    cntx.moveTo(v[0]+radius,v[1]);
    let triggerspacing = 0;
    for (let key in triggers){
      if (triggers[key][key]=== 'custom' && triggers[key].element.checked) {        
        cntx.font = "16px Arial";
        cntx.fillText(document.getElementById('customtext').value, v[0]-13.5+triggerspacing,v[1]-13.5)
      } else {
        if(triggers[key].element.checked) {

          cntx.drawImage(triggers[key].icon, v[0]-13.5+triggerspacing,v[1]-13.5,25,25);
          triggerspacing = triggerspacing + offset;

          if (triggers[key].radiobetter.checked) {
            cntx.drawImage(makebetter, v[0]+triggerspacing-36,v[1]-12,40,40);
          } else if (triggers[key].radioworse.checked) {
            cntx.drawImage(makesworse, v[0]+triggerspacing-36,v[1]-12,40,40);
          }
        } 
          
      };
    };

    cntx.stroke();
    path = [];

    imgdata.push(cntx.getImageData(0,0,canvas.width, canvas.height));

    closetriggers();
  }

})
