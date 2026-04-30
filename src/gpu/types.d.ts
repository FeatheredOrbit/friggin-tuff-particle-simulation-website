interface uniformData {
    particleNumber: number,
    textureWidth: number,
    textureHeight: number,
    windowScaleFactor: number
}

// These must be floats bit-casted to integers.
interface Particle {
  // X slot is a particle type: 0 = Red || 1 = Green || 2 = Blue. Just cast them to u32 though.
  type: number;
  xPos: number;
  yPos: number;
}