import { Pickable } from "../checkers/Pickable.js";
import { MyRectangle } from "./MyRectangle.js";

export class MyButton extends Pickable {
    constructor(scene, id, p1, p2, pickable, pickId, onPick) {
        super(pickId, pickable);
        this.scene = scene;
        this.id = id;
        this.pickId = pickId;
        this.button = new MyRectangle(scene, id, p1[0], p2[0], p1[1], p2[1]);
        this.onPick = onPick;
    }

    display() {
        this.registerPickable(this.scene, this);
        this.button.display();
        this.unregisterPickable(this.scene);
    }
}