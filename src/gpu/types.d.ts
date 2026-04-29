interface uniformData {
    particleNumber?: number,
    textureWidth?: number,
    textureHeight?: number,
    windowScaleFactor?: number
}

// These need to be floats.
interface Particle {
  // X slot is particle type: 0 = Red || 1 = Green || 2 = Blue. Just cast them to u32 though.
  type: number;
  xPos: number;
  yPos: number;
}