import { Pickable } from "../checkers/Pickable.js";
import { writeText } from "../checkers/utils.js";
import { MyRectangle } from "./MyRectangle.js";

export class MyButton extends Pickable {
    constructor(scene, id, p1, p2, pickable, pickId, onPick, text, translate, rotate, scale) {
        super(pickId, pickable);
        this.scene = scene;
        this.id = id;
        this.pickId = pickId;
        this.button = new MyRectangle(scene, id, p1[0], p2[0], p1[1], p2[1]);
        this.text = text;
        this.translate = translate;
        this.rotate = rotate;
        this.scale = scale;
        this.onPick = onPick;
    }

    display() {
        this.registerPickable(this.scene, this);
        this.button.display();
        this.unregisterPickable(this.scene);

        this.displayText();
    }

    displayText() {
        if (this.text) {
            this.scene.pushMatrix();
            // 	Reset transf. matrix to draw independent of camera
            this.scene.loadIdentity();
            // transform as needed to place on screen
            this.scene.translate(this.translate[0], this.translate[1], this.translate[2]);
            writeText(this.scene, this.text);
            this.scene.popMatrix();
        }
    }
}