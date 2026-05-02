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
  threshold: 10
});

pinch.recognizeWith(rotate);
hammerManager.add([pinch, rotate]);

let currentScale= 1;
let currentRotation= 0;

hammerManager.on("rotatestart", (val) => {
  // For some reason when first placing your fingers down to start rotating,
  // a very large number is returned for rotation? Like in my case every time
  // I placed my fingers down, it applied a random rotation before properly
  // rotating. My solution was to subtract it in rotatestart so that it cancels
  // out with the one in rotatemove.
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