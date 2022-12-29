import { TextBlock } from "../../text/TextBlock.js";

export class TestMenu {
    constructor(scene) {
        this.scene = scene;
        this.blocks = [];

        this.buildBlocks();
    }

    buildBlocks() {
        const block1 = new TextBlock(this.scene, "ola", [-10, 7], 5, 1, "center", [1, 1, 1, 1], () => console.log("ola"));
        const block2 = new TextBlock(this.scene, "adeus", [-0.5, -0.5], 5, 5, "center", [1, 0, 1, 1], () => console.log("adeus"));
        this.blocks.push(block1, block2);
    }


    display() {
        this.scene.gl.disable(this.scene.gl.DEPTH_TEST);
        this.scene.pushMatrix();
        this.scene.loadIdentity();
		this.scene.translate(0, 0, -50);

        this.blocks.forEach(block => {
            block.display();
        });

        this.scene.popMatrix();

        this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
    }
}