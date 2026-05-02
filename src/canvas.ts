import "hammerjs";

const hammerManager = new Hammer.Manager(
  document.getElementById("canvas-container") as HTMLElement,
);
const pinch = new Hammer.Pinch({
  direction: Hammer.DIRECTION_ALL,
  enable: true,
  threshold: 15
});
const rotate = new Hammer.Rotate({
  direction: Hammer.DIRECTION_ALL,
  enable: true,
  threshold: 15
});

pinch.recognizeWith(rotate);

hammerManager.add([pinch, rotate]);

let currentScale= 1;
let currentRotation= 0;

hammerManager.on("rotatestart", (val) => {
  currentRotation -= val.rotation;
});

hammerManager.on("pinchmove rotatemove", (val) => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

 canvas.style.transform = `translate(-50%, -50%) rotate(${currentRotation + val.rotation}deg) scale(${currentScale * val.scale})`;

});

hammerManager.on("pinchend rotateend", (val) => {
  currentScale *= val.scale;
  currentRotation += val.rotation;
});