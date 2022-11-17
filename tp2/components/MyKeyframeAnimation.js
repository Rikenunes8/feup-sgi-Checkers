import { MyAnimation } from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {
    constructor(scene, keyframes = []) {
        super(scene);
        this.keyframes = keyframes;
    }

    update(time) {
        let keyframeIndex = 0;
        while (keyframeIndex < this.keyframes.length - 1 && this.keyframes[keyframeIndex + 1].instant <= time) {
            keyframeIndex++;
        }
        if (keyframeIndex == this.keyframes.length - 1) {
            return;
        }
        const keyframe = this.keyframes[keyframeIndex];
        const nextKeyframe = this.keyframes[keyframeIndex + 1];
        const instant = time - keyframe[0];
        const duration = nextKeyframe[0] - keyframe[0];
        const percentage = instant / duration;
        vec3.lerp(keyframe, nextKeyframe, percentage);
        return true;
    }

    addKeyframe(keyframe) {
        this.keyframes.push(keyframe);
    }
}