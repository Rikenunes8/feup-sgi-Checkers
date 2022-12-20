import { Pickable } from "../checkers/Pickable.js";
import { MyRectangle } from "./MyRectangle.js";

export class MyButton extends Pickable {
    constructor(scene, id, p1, p2, pickable, onPick) {
        super(id, pickable);
        this.button = new MyRectangle(scene, id, p1[0], p2[0], p1[1], p2[1]);
        this.onPick = onPick;
    }

    display() {
        this.button.display();
    }
}