document.addEventListener("DOMContentLoaded", function() {

// set up canvas(es)
  let backgroundcanvas = document.getElementById('backgroundcanvas');
  let backgroundcntx = backgroundcanvas.getContext("2d");
  let canvas = document.getElementById('canvas');
  let cntx = canvas.getContext("2d");
  let isPainting = false;
  let addsymptombutton = document.getElementById('addset');
  let setcontainer = document.getElementById('setcontainer');
  let canvascontainer = document.getElementById('canvascontainer');
  let canvascounter = 0;
  
  function createCanvas(params) {
    canvascounter++;
    let newlayer = document.createElement('canvas');
    newlayer.classList.add(`canvas${canvascounter}`, "subcanvas");
    newlayer.width ="500";
    newlayer.height ="500";
    canvascontainer.insertBefore(newlayer,canvas);
    
    let newtablabel = document.createElement("label");
    newtablabel.setAttribute("for",  `forcanvas${canvascounter}`);
    newtablabel.innerHTML = `
      <input type="text" value="Symptom set ${canvascounter}">
      <input class="settab" type="radio" name="layers" checked="checked" id="forcanvas${canvascounter}"> 
      <input class="showlayer" type="checkbox" checked="checked" id="showlayer${canvascounter}">
      `
    setcontainer.appendChild(newtablabel);

    let newtab = document.getElementById(`forcanvas${canvascounter}`);
    let vis = document.getElementById(`showlayer${canvascounter}`);
    newtab.addEventListener("click",()=>{cntx = newlayer.getContext("2d");}); //this gets the encapsulated layer i think - it works at any rate
    vis.addEventListener("click",()=>{
      if (vis.checked) {
        newlayer.style = ""
      } else {
        newlayer.style = "display: none;";
      }
    })
    cntx = newlayer.getContext("2d");
  }

  createCanvas()
  addsymptombutton.addEventListener('click', createCanvas);
  

// set up variables to store current path and drawing history
  let path = [];
  let imgdata = [cntx.getImageData(0,0,canvas.width, canvas.height)];
  let makebetter = new Image();
  let makesworse = new Image();
  makebetter.src = `images/makebetter.png`;
  makesworse.src = `images/makesworse.png`;

// line style controls & color handling
  let lineWidth = document.getElementById('lineWidth');
  let intensity = document.getElementById('intensity');
  let linesize = document.getElementById("linesize");
  let erasebutton = document.getElementById('erase');

  function updateLinesize(){
    cntx.lineCap = 'round';
    cntx.lineJoin = "round";
    cntx.lineWidth = lineWidth.value;

    if (erasebutton.checked) {
      cntx.globalCompositeOperation = "destination-out";  
      intensity.disabled = true;
    } else {
      cntx.globalCompositeOperation = "source-over";  
      intensity.disabled = false;
    }

    let redvalue = intensity.value >= 0.2 ? 255 : 200 + 255 * (intensity.value)
    let greenvalue = intensity.value < 0.2 ? 255 : 255 * (1-intensity.value)
    // let gbvalue = 255 * (1-intensity.value)
    console.log(intensity.value,redvalue,greenvalue);
    let color = erasebutton.checked? "rgb(255,255,255)":`rgb(${redvalue}, ${greenvalue}, 0 )`;
    cntx.strokeStyle = color;
    linesize.style = `background-color: ${color}; width:${lineWidth.value}px; height:${lineWidth.value}px;`;
  };

  lineWidth.addEventListener("input", () => { updateLinesize(); });
  intensity.addEventListener("input", () => { updateLinesize(); });
  erasebutton.addEventListener("click",() => { updateLinesize(); });


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
    triggers[key].radioBtr = document.getElementById(`${key}better`);
    triggers[key].radioWrs = document.getElementById(`${key}worse`);
    triggers[key].radioWrs.addEventListener('change', ()=>{
      if (triggers[key].radioWrs.checked) {
        // console.log(key, 'better',triggers[key].radioBtr.checked, 'worse',triggers[key].radioWrs.checked,);
      }
    });
    triggers[key].radioBtr.addEventListener('change', ()=>{
      if (triggers[key].radioBtr.checked){
        // console.log(key, 'better',triggers[key].radioBtr.checked, 'worse',triggers[key].radioWrs.checked,);
      } 
    });
    triggers[key].element.addEventListener('click', ()=>{
      if ( triggers[key].element.checked){
        triggers[key].radio.style.display = 'flex';
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
    canvas.addEventListener("mouseup", stamptrigger);
    canvas.addEventListener("touchend", stamptrigger);

    triggertypebox.style.display = "flex"; //to make it not hidden
    triggerbutton.style.display = "none";
  });

  //close triggers
  let hidetriggers = document.getElementById('closetrigger');
  function closetriggers() {
    triggertypebox.style = 'display: none';
    triggerbutton.style.display = "initial";

    canvas.removeEventListener('mousedown', drawtrigger);
    canvas.removeEventListener('touchstart', drawtrigger);
    canvas.removeEventListener("mouseup", stamptrigger);
    canvas.removeEventListener("touchend", stamptrigger);
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
  // let instructions = document.getElementById('showinstructiondisplay');
  // let instructionsbutton = document.getElementById('showinstructionsbutton');
  // instructionsbutton.addEventListener('click', ()=>{
  //   instructions.style = 'display: contents';
  //   instructionsbutton.style = 'display: none;'
  // });
  // let hidebutton = document.getElementById('hideinstructions');
  // hidebutton.addEventListener('click',()=>{
  //   instructions.style = 'display: none';
  //   instructionsbutton.style = 'display: initial;'
  // })

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
      cntx.clearRect(0,0,canvas.width,canvas.height);
    });

//SAVE
  let savebutton = document.getElementById('savebutton');
  savebutton.addEventListener("click", () => {
    backgroundcntx.globalAlpha = 0.9;
    let canvases = document.getElementsByClassName("subcanvas");

    for (let i = 0; i < canvascounter; i++) {
      backgroundcntx.drawImage(canvases[i],0,0);
    }

    const link = document.createElement("a"); // a referes to the type of element created aka <a href> link element
    link.download = "PainPaintingImage.png";
    link.href = backgroundcanvas.toDataURL();
    link.click();

    backgroundcntx.globalAlpha = 1; 
    backgroundcntx.drawImage(img, 0, 0,canvas.width, canvas.height); //redraw to clear background img
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
    updateLinesize();
    isPainting = true;
    path.push([e.offsetX,e.offsetY],[e.offsetX,e.offsetY]); //two points are needed to make canvas's stroke show up for first point
    drawPath();
  }

  function onMove(e) {
    if (isPainting === true) {
      path.push([e.offsetX,e.offsetY]);
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
    cntx.lineWidth = 1;
    cntx.strokeStyle = `rgb(0, 0, 0, 1)`;
    path.push([e.offsetX,e.offsetY]);
  }

  function vectorizePath(A,B,offset) {
    let d = Math.sqrt(Math.pow(B[0]-A[0],2)+ Math.pow(B[1]-A[1],2));
    let u = [(B[0]-A[0])/d, (B[1]-A[1])/d];
    return [B[0]+offset*u[0],B[1]+offset*u[1]];
  }

  function stamptrigger(e) {
    path.push([e.offsetX,e.offsetY]);
    let A = path[0];
    let B = path[1];
    if (A[0]==B[0] && A[1]==B[1]){
      B = [B[0]+1,B[1]+1]
      // hacky way to make stamp show up if only click on canvas not draw line
      // probably a better way to do this but it works for now. sorry future me
    };
    let offset = 20;
    let v = vectorizePath(A,B,offset);

    drawPath();
    // cntx.lineTo(e.offsetX,e.offsetY);
    // cntx.beginPath();
    // cntx.moveTo(A[0],A[1]);
    // cntx.lineTo(B[0],B[1]);
    // cntx.stroke();
    let radius = 10;
    cntx.moveTo(v[0]+radius,v[1]);
    let triggerspacing = 0;
    let thumboffset = -13.5;
    let thumb = makesworse;
    for (let key in triggers){
      if(triggers[key].element.checked) {
          if (triggers[key][key]=== 'custom') {        
            cntx.font = "12px Arial";
            cntx.fillText(document.getElementById('customtext').value, v[0]+triggerspacing,v[1])
          } else {
            cntx.drawImage(triggers[key].icon, v[0]+thumboffset+triggerspacing,v[1]+thumboffset,25,25);
          }
          
          triggerspacing = triggerspacing + offset;
          
          triggers[key].radioBtr.checked? thumb = makebetter : thumb = makesworse;
          cntx.drawImage(thumb, v[0]+triggerspacing-36,v[1]-12,40,40);
        }
    };

    cntx.stroke();
    path = [];

    imgdata.push(cntx.getImageData(0,0,canvas.width, canvas.height));

    closetriggers();
  }

})
