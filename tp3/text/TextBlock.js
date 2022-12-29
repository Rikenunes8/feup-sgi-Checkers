import { MyRectangle } from "../components/MyRectangle.js";
import { CGFappearance } from "../../lib/CGF.js";
import { Pickable } from "../checkers/Pickable.js";

export class TextBlock extends Pickable{
    constructor(scene, text, p1, width, height, allign, backgroundColor, action) {
        super(null, true);
        this.scene = scene;
        this.text = text;
        this.p1 = p1;
        this.height = height;
        this.width = width;
        this.allign = allign;
        this.backgroundColor = backgroundColor ?? null;
        this.onPick = action ?? null;
        if (this.hasBackground()) {
            this.background = new MyRectangle(scene, null, p1[0], p1[0]+width, p1[1], p1[1]+height);
            this.backgroundAppearance = new CGFappearance(scene);
            this.backgroundAppearance.setEmission(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], 1);
            this.backgroundAppearance.setAmbient(0, 0, 0, 1);
            this.backgroundAppearance.setDiffuse(0, 0, 0, 1);
            this.backgroundAppearance.setSpecular(0, 0, 0, 1);
        }
    }

    display() {
        const spacing = 0.7;
        this.scene.pushMatrix();
        this.scene.scale(2, 2, 1)
            
        if (this.hasBackground()) {
            this.backgroundAppearance.apply();
            this.registerPickable(this.scene, this);
            this.background.display();
            this.unregisterPickable(this.scene);
        }

        if (this.hasText()) {
            // Put text in the left down backgrounf color
            this.scene.translate(this.p1[0] + 0.35, this.p1[1], 0);
            if (this.allign == "center") {
                const textWidth = this.text.length*0.1 + (this.text.length-1)*spacing;
                this.scene.translate(this.width/2-textWidth/2, 0, 0); // center in width
            }
            this.scene.translate(0, this.height/2, 0); // center in height
            this.scene.texter.writeText(this.text, spacing);
        }

        this.scene.popMatrix();
    }

    hasBackground() {
        return this.backgroundColor != null;
    }

    hasText() {
        return this.text != null && this.text != "";
    }

    setText(text) {
        this.text = text;
    }

}