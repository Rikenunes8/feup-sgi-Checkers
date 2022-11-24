export class MyKeyframe {
    /**
     * Stores the instant of the keyframe and its the transformations.
     * @param {*} instant
     * @param {*} translate 
     * @param {*} rotateZ 
     * @param {*} rotateY 
     * @param {*} rotateX 
     * @param {*} scale 
     */
    constructor(instant, translate, rotateZ, rotateY, rotateX, scale) {
        this.instant = instant;
        this.translate = translate;
        this.rotateZ = rotateZ;
        this.rotateY = rotateY;
        this.rotateX = rotateX;
        this.scale = scale;
    }
}