import { MyRectangle } from "../components/MyRectangle.js";
import { CGFappearance } from "../../lib/CGF.js";
import { Pickable } from "../checkers/Pickable.js";

export class TextBlock extends Pickable{
    constructor(scene, text, allign, p1, width, height, action = null, backgroundColor1 = null, backgroundColor2 = null) {
        super(null, true);
        this.scene = scene;
        this.text = text;
        this.allign = allign;
        this.p1 = p1;
        this.height = height;
        this.width = width;
        this.onPick = action ?? null;
        this.backgroundColor1 = backgroundColor1 ?? null;
        this.backgroundColor2 = backgroundColor2 ?? null;
        if (this._hasBackground()) {
            this.background = new MyRectangle(scene, null, p1[0], p1[0]+width, p1[1], p1[1]+height);
            this.backgroundAppearance1 = this._buildAppearance(this.backgroundColor1);
            this.backgroundAppearance2 = this._buildAppearance(this.backgroundColor2);
            this.backgroundAppearance = this.backgroundAppearance1;
        }
    }

    display() {
        const spacing = 0.7;
        this.scene.pushMatrix();
        this.scene.scale(2, 2, 1)
        this.scene.translate(-this.width/2, -this.height/2, 0)
            
        if (this._hasBackground()) {
            this.backgroundAppearance.apply();
            this.registerPickable(this.scene, this);
            this.background.display();
            this.unregisterPickable(this.scene);
        }

        if (this._hasText()) {
            // Put text in the left down background color
            this.scene.translate(this.p1[0] + 0.35, this.p1[1], 0);
            if (this.allign == "center") {
                const textWidth = this.text.length*0.035 + (this.text.length-1)*spacing;
                this.scene.translate(this.width/2-textWidth/2, 0, 0); // center in width
            }
            this.scene.translate(0, this.height/2, 0); // center in height
            this.scene.texter.writeText(this.text, spacing);
        }

        this.scene.popMatrix();
    }


    setText(text) {
        this.text = text;
    }

    changeBackgroundColor(usePrimary) {
        if (!this._hasBackground2()) return;
        this.backgroundAppearance = usePrimary ? this.backgroundAppearance1 : this.backgroundAppearance2;
    }

    _buildAppearance(color) {
        if (color == null) return null;
        const backgroundAppearance = new CGFappearance(this.scene);
        backgroundAppearance.setEmission(color[0], color[1], color[2], color[3]);
        backgroundAppearance.setAmbient(0, 0, 0, 1);
        backgroundAppearance.setDiffuse(0, 0, 0, 1);
        backgroundAppearance.setSpecular(0, 0, 0, 1);
        return backgroundAppearance;
    }

    _hasBackground() {
        return this.backgroundColor1 != null;
    }

    _hasBackground2() {
        return this.backgroundColor2 != null;
    }

    _hasText() {
        return this.text != null && this.text != "";
    }
}