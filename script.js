document.addEventListener("DOMContentLoaded", function() {

// set up canvas
  let canvas = document.getElementById('canvas');
  let cntx = canvas.getContext("2d");
  let isPainting = false;

// set up variables to store current path and drawing history
  let path = [];
  let imgdata = [];
  let makebetter = new Image();
  let makesworse = new Image();
  makebetter.src = `images/makebetter.png`;
  makesworse.src = `images/makesworse.png`;
  

// initializing line style
  cntx.lineCap = 'round';
  cntx.lineJoin = "round";
  cntx.lineWidth = 15;
  cntx.strokeStyle = `rgb(255, 0, 0, 0.5)`;

  // initialize trigger types object
  let triggers = {
    heat: {heat: 'heat'},
    cold: {cold:'cold'},
    touch: {touch:'touch'},
    movement: {movement:'movement'},
    custom: {custom:'custom'}
  };

  for (let key in triggers) {
    let currenttrigger = triggers[key];
    currenttrigger.icon = new Image();
    currenttrigger.icon.src = `images/${key}icon.png`;
    currenttrigger.element = document.getElementById(key);
    currenttrigger.radio = currenttrigger.element.nextElementSibling;
    currenttrigger.radiobetter = document.getElementById(`${key}better`);
    currenttrigger.radioworse = document.getElementById(`${key}worse`);
    currenttrigger.radioworse.addEventListener('change', ()=>{
      if (currenttrigger.radioworse.checked) {
        console.log(key, 'better',currenttrigger.radiobetter.checked, 'worse',currenttrigger.radioworse.checked,);
      }
    });
    currenttrigger.radiobetter.addEventListener('change', ()=>{
      if (currenttrigger.radiobetter.checked){
        console.log(key, 'better',currenttrigger.radiobetter.checked, 'worse',currenttrigger.radioworse.checked,);
      } 
    });
    currenttrigger.element.addEventListener('click', ()=>{
      if ( currenttrigger.element.checked){
        currenttrigger.radio.style.display = 'contents';
      } else {
        currenttrigger.radio.style.display = 'none';
      };
    });
  };

// toolbar listeners and functions
  // line style controls
  let lineWidth = document.getElementById('lineWidth');
  let intensity = document.getElementById('intensity');
  lineWidth.addEventListener("input", (e) => {cntx.lineWidth = lineWidth.value;});
  intensity.addEventListener("input", (e) => {cntx.strokeStyle = `rgb(255, 0, 0, ${intensity.value})`;});


// draw background body outline
  let img = document.getElementById('outlineimg');
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
    //two points are needed to make canvas's stroke show up
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
  //end of main drawing functions

  //drawing triggers functions
  let triggerbutton = document.getElementById('trigger');
  let triggertypebox = document.getElementById("triggertypes");

  triggerbutton.addEventListener('click', (e) => {
    canvas.removeEventListener("touchstart",onStart);
    canvas.removeEventListener("mousedown",onStart);
    canvas.addEventListener('mousedown', drawtrigger);
    canvas.addEventListener('touchstart', drawtrigger);
    canvas.addEventListener("mouseup", triggerstamp);
    canvas.addEventListener("touchend", triggerstamp);

    triggertypebox.style.display = "contents"; //to make it not hidden
  });

  function drawtrigger(e) {
    cntx.lineWidth = 1;
    cntx.strokeStyle = `rgb(0, 0, 0, 1)`;
    path.push([e.offsetX,e.offsetY]);
  }

  function triggerstamp(e) {
    path.push([e.offsetX,e.offsetY]);
    let A = path[0];
    let B = path[1];
    let x = 0;
    let y = 1;
    let d = Math.sqrt(Math.pow(B[x]-A[x],2)+ Math.pow(B[y]-A[y],2));
    let u = [(B[x]-A[x])/d, (B[y]-A[y])/d];
    let offset = 20;
    let v = [B[x]+offset*u[x],B[y]+offset*u[y]];


    cntx.lineTo(e.offsetX,e.offsetY);
    cntx.beginPath();
    cntx.moveTo(A[x],A[y]);
    cntx.lineTo(B[x],B[y]);
    cntx.stroke();
    let radius = 10;
    cntx.moveTo(v[x]+radius,v[y]);
    let triggerspacing = 0;
    for (let key in triggers){
      if (triggers[key][key]=== 'custom') {
        
      } else {
        if(triggers[key].element.checked) {
          // console.log('triggers[key].radiobetter', triggers[key].radiobetter);
          // console.log('triggers[key]radiobetter.checked', triggers[key].radiobetter.checked);

          cntx.drawImage(triggers[key].icon, v[x]-13.5+triggerspacing,v[y]-13.5,25,25);
          triggerspacing = triggerspacing + offset;

          if (triggers[key].radiobetter.checked) {
            // console.log('radiobetterifcheck');
            cntx.drawImage(makebetter, v[x]+triggerspacing-36,v[y]-12,40,40);
          } else if (triggers[key].radioworse.checked) {
            cntx.drawImage(makesworse, v[x]+triggerspacing-36,v[y]-12,40,40);
          }
        } 
          
      };
    };

    cntx.stroke();
    path = [];

    canvas.removeEventListener("mouseup", triggerstamp);
    canvas.removeEventListener("touchend", triggerstamp);
    canvas.removeEventListener('mousedown', drawtrigger);
    canvas.removeEventListener('touchstart', drawtrigger);
    canvas.addEventListener("mousedown",onStart);
    canvas.addEventListener("touchstart",onStart);

    imgdata.push(cntx.getImageData(0,0,canvas.width, canvas.height));
    cntx.lineWidth = lineWidth.value;
    cntx.strokeStyle = `rgb(255, 0, 0, ${intensity.value})`;

    triggertypebox.style.display = "none";
    for (let key in triggers) {
      triggers[key].radio.style.display = 'none';
      triggers[key].element.checked = false;
      
    }
  }

})
