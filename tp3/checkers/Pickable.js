let counter = 10000; // counter to generate unique pick ids

export class Pickable {
    constructor(pickId, pickable = false) {
        this.pickId = pickId;
        if (!pickId) this.pickId = counter++;
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

    onPick() {
        throw new Error("Method 'onPick()' must be implemented in subclasses.");
    }
    
}