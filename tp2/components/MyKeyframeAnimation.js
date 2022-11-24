import { MyAnimation } from "./MyAnimation.js";

export class MyKeyframeAnimation extends MyAnimation {
    constructor(scene, keyframes = []) {
        super(scene);
        this.keyframes = keyframes;
        this.translate = vec3.fromValues(0, 0, 0);
        this.rotate = vec3.fromValues(0, 0, 0);
        this.scale = vec3.fromValues(1, 1, 1);
        this.animationMatrix = mat4.create();
        this.started = false;
        this.changed = false;
    }

    update(time) {
        this.changed = false;
        this.started = false;

        // Find the keyframes that are before and after the current time
        let keyframeIndex = -1;
        while (keyframeIndex < this.keyframes.length - 1 && this.keyframes[keyframeIndex + 1].instant <= time) {
            keyframeIndex++;
        }
        // If there are no keyframes before this time, keep the component not displayed
        if (keyframeIndex == -1) return;
        // Otherwise the animation has started
        this.started = true;
        // If the time is after the last keyframe, keep the last keyframe
        if (keyframeIndex == this.keyframes.length - 1) return;
        // If the time is between keyframes, interpolate and announce that the animation matrix will need to be changed
        this.changed = true;

        // MyKeyframe
        const keyframe = this.keyframes[keyframeIndex];
        // MyKeyframe
        const nextKeyframe = this.keyframes[keyframeIndex + 1];

        const instant = time - keyframe.instant;
        const duration = nextKeyframe.instant - keyframe.instant;
        const percentage = instant / duration;

        // interpolate keyframes
        vec3.lerp(this.translate, keyframe.translate, nextKeyframe.translate, percentage);
        vec3.lerp(this.rotate, [keyframe.rotateX, keyframe.rotateY, keyframe.rotateZ], [nextKeyframe.rotateX, nextKeyframe.rotateY, nextKeyframe.rotateZ], percentage);
        vec3.lerp(this.scale, keyframe.scale, nextKeyframe.scale, percentage);      

        return true;
    }

    apply() {
        if (this.changed) {
            // construct animation matrix
            this.animationMatrix = mat4.create();
            this.animationMatrix = mat4.translate(this.animationMatrix, this.animationMatrix, this.translate);
            this.animationMatrix = mat4.rotateZ(this.animationMatrix, this.animationMatrix, this.rotate[2]);
            this.animationMatrix = mat4.rotateY(this.animationMatrix, this.animationMatrix, this.rotate[1]);
            this.animationMatrix = mat4.rotateX(this.animationMatrix, this.animationMatrix, this.rotate[0]);
            this.animationMatrix = mat4.scale(this.animationMatrix, this.animationMatrix, this.scale);
        }
        this.scene.scene.multMatrix(this.animationMatrix);

        return this.started;
    }

    addKeyframe(keyframe) {
        this.keyframes.push(keyframe);
    }
}