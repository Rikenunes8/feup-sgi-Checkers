export class Pickable {
    constructor(pickId, pickable = false) {
        this.pickId = pickId;
        this.pickable = pickable;
    }

    registerPickable(scene, object) {
        if (this.pickable) {
            scene.registerForPick(this.pickId, object);
        }
    }

    unregisterPickable(scene) {
        if (this.pickable) {
            scene.clearPickRegistration();
        }
    }

}