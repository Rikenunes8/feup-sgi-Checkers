import { MyAnimation } from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {
    constructor(scene, keyframes = []) {
        super(scene);
        this.keyframes = keyframes;
        this.currentKeyframe = 0;
        this.currentInstant = 0;
        this.transfMatrix = mat4.create();
    }

    addKeyframe(instant, transfMatrix) {
        this.keyframes.push([instant, transfMatrix]);
    }
}