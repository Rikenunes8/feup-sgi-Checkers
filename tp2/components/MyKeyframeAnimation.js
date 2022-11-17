import { MyAnimation } from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {
    constructor(scene, keyframes = []) {
        super(scene);
        this.keyframes = keyframes;
        this.animationMatrix = mat4.create();
    }

    update(time) {
        let keyframeIndex = 0;
        while (keyframeIndex < this.keyframes.length - 1 && this.keyframes[keyframeIndex + 1].instant <= time) {
            keyframeIndex++;
        }
        if (keyframeIndex == this.keyframes.length - 1) {
            return;
        }

        // MyKeyframe
        const keyframe = this.keyframes[keyframeIndex];
        // MyKeyframe
        const nextKeyframe = this.keyframes[keyframeIndex + 1];

        const instant = time - keyframe[0];
        const duration = nextKeyframe[0] - keyframe[0];
        const percentage = instant / duration;
        
        // interpolate keyframes
        vec3.lerp(keyframe, nextKeyframe, percentage);

        // construct animation matrix
        mat4.fromTranslation(this.animationMatrix, keyframe.translate);
        mat4.rotateZ(this.animationMatrix, this.animationMatrix, keyframe.rotateZ);
        mat4.rotateY(this.animationMatrix, this.animationMatrix, keyframe.rotateY);
        mat4.rotateX(this.animationMatrix, this.animationMatrix, keyframe.rotateX);
        mat4.scale(this.animationMatrix, this.animationMatrix, keyframe.scale);

        return true;
    }

    addKeyframe(keyframe) {
        this.keyframes.push(keyframe);
    }
}