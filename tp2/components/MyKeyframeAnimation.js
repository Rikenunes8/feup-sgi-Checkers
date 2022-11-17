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

        const instant = time - keyframe.instant;
        const duration = nextKeyframe.instant - keyframe.instant;
        const percentage = instant / duration;

        let translate = vec3.create();
        let rotate = vec3.create();
        let scale = vec3.create();

        // interpolate keyframes
        vec3.lerp(translate, keyframe.translate, nextKeyframe.translate, percentage);
        vec3.lerp(rotate, [keyframe.rotateX, keyframe.rotateY, keyframe.rotateZ], [nextKeyframe.rotateX, nextKeyframe.rotateY, nextKeyframe.rotateZ], percentage);
        vec3.lerp(scale, keyframe.scale, nextKeyframe.scale, percentage);      

        // construct animation matrix
        this.animationMatrix = mat4.create();
        this.animationMatrix = mat4.translate(this.animationMatrix, this.animationMatrix, translate);
        this.animationMatrix = mat4.rotateZ(this.animationMatrix, this.animationMatrix, rotate[2]);
        this.animationMatrix = mat4.rotateY(this.animationMatrix, this.animationMatrix, rotate[1]);
        this.animationMatrix = mat4.rotateX(this.animationMatrix, this.animationMatrix, rotate[0]);
        this.animationMatrix = mat4.scale(this.animationMatrix, this.animationMatrix, scale);

        return true;
    }

    addKeyframe(keyframe) {
        this.keyframes.push(keyframe);
    }
}