import { CurrentPlayer } from "./GameRuler.js";
import { CGFcameraAxisID } from "../../lib/CGF.js";

export const checkersViewName = "Checkers";

export class AnimationCamera {
    constructor() {
        this.animating = false;
        this.animatingOnClick = false;
        this.clickedCount = 0;
        this.rotationAngle = 0.05; // rotate 5% on each update
        this.currAngle = 0;
        this.maxRotationAngle = Math.PI;
        this.rotatePositive = 1; // 1 or -1 depending on the direction of the rotation
        this.rotatePosOnClick = -1; // 1 or -1 depending on the direction of the rotation when clickin
    }

    update(camera) {
        if (this.animating || this.animatingOnClick) {
            const rotatePositive = this.animatingOnClick ? this.rotatePosOnClick : this.rotatePositive;
            const rotateAngle = this.maxRotationAngle * this.rotationAngle * rotatePositive;
            const maxRotationAngle = this.animatingOnClick ? this.maxRotationAngle / 2 : this.maxRotationAngle;

            camera.orbit(CGFcameraAxisID.Y, rotateAngle);
            this.currAngle += rotateAngle; 

            if (this.currAngle * rotatePositive >= maxRotationAngle) {
                this.animating = false;
                this.animatingOnClick = false;
                this.currAngle = 0;
            }
        }
    }

    rotate(player, camera) {
        if (camera.name != checkersViewName) return;
        if (player == CurrentPlayer.P1) {
            this.rotatePositive = -1;
        } else {
            this.rotatePositive = 1;
        }
        this.rotatePosOnClick *= -1;
        this.animating = true;
    }

    /**
     * Handler for the change camera button.
     * Rotates the camera from the following states:
     * Player 1 -> Middle Screen -> Player 2 -> Middle Screen -> Player 1...
     */
    handle(camera) {
        if (camera.name != checkersViewName) return;
        if (this.clickedCount % 2 == 0 && this.clickedCount != 0) {
            this.rotatePosOnClick *= -1;
            this.clickedCount = 0;
        }

        this.clickedCount += 1;
        this.animatingOnClick = true;
    }
}