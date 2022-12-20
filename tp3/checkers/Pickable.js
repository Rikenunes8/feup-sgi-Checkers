export class Pickable {
    constructor(pickable = false) {
        this.pickable = pickable;
    }

    registerPickable(scene, id, object) {
        if (this.pickable) {
            scene.registerForPick(id, object);
        }
    }

    unregisterPickable(scene) {
        if (this.pickable) {
            scene.clearPickRegistration();
        }
    }

}