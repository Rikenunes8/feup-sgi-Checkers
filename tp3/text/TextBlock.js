import { MyRectangle } from "../components/MyRectangle";

export class TextBlock {
    constructor(scene, text, p1, height, width, allign, backgroundColor) {
        this.scene = scene;
        this.text = text;
        this.p1 = p1;
        this.height = height;
        this.width = width;
        this.allign = allign;
        this.hasBackground = backgroundColor != null;
        if (this.hasBackground) {
            this.backgroundColor = backgroundColor;
            this.background = new MyRectangle(scene, null, p1[0], p1[0]+width, p1[1], p1[1]+height);
            this.backgroundAppearance = new CGFappearance(scene);
            this.backgroundAppearance.setEmission(backgroundColor[0], backgroundColor[1], backgroundColor[2], 1);
        }
    }

    display() {
        if (this.hasBackground) {
            this.backgroundAppearance.apply();
            this.registerPickable(this.scene, this);
            this.background.display();
            this.unregisterPickable(this.scene);
        }
        this.scene.pushMatrix();
        this.scene.translate(this.p1[0], this.p1[1], 0);
        if (this.allign == "center") {
            this.scene.translate(this.width/2, this.height/2, 0);
        }
        this.scene.texter.writeText(this.text, 0.7);
        this.scene.popMatrix();
    }


}