export class Checkers {
    constructor (scene, mainboard) {
        this.scene = scene;
        this.mainboard = mainboard;
    }

    display() {
        this.mainboard.display();
    }
}