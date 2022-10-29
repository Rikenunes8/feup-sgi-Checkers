import { XMLParser, DEGREE_TO_RAD } from "./XMLParser.js";
import { MyKeyframeAnimation } from "../components/MyKeyframeAnimation.js";

export class XMLParserAnimations extends XMLParser {
    constructor(scene) {
        super(scene);
    }
    parse(node) {
        const myAnimations = {};
        const animations = node.children;
        for (let i = 0; i < animations.length; i++) {
            const animation = animations[i]
            if (animation.nodeName != "keyframeanim") {
                this.onXMLMinorError("unknown tag <" + animation.nodeName + ">");
                return;
            }
            const error = this.parseKeyframeanim(myAnimations, animation);
            if (error != null) return error;
        }

    }

    parseKeyframeanim(myAnimations, animation) {
        const animationId = this.reader.getString(animation, 'id', false);
        if (animationId == null) return "no ID defined for animation";
        if (myAnimations[animationId] != null) return "ID must be unique for each animation (conflict: ID = " + animationId + ")";

        const myKeyframeAnimation = new MyKeyframeAnimation(this.scene);

        const keyframes = animation.children;
        let lastInstant = -1;
        for (let i = 0; i < keyframes.length; i++) {
            if (keyframes[i].nodeName != "keyframe") {
                this.onXMLMinorError("unknown tag <" + keyframes[i].nodeName + ">");
                return;
            }
            const error = this.parseKeyframe(myKeyframeAnimation, keyframes[i], animationId);
            if (error != null) return error;
            let inst = myKeyframeAnimation.keyframes[myKeyframeAnimation.keyframes.length-1][0];
            if (inst <= lastInstant) return "keyframes must be defined in ascending order";
            else lastInstant = inst;
        }
        if (myKeyframeAnimation.keyframes.length < 1) return "animation must have at least 1 keyframes";

        myAnimations[animationId] = myKeyframeAnimation;
    }
    parseKeyframe(myKeyframeAnimation, keyframeNode, animationId) {
        const instant = this.reader.getFloat(keyframeNode, 'instant', false);
        if (instant == null) return "no instant defined for keyframe";

        const transformations = keyframeNode.children;
        const transformationNames = ["translation", "rotation", "rotation", "rotation", "scale"];
        if (transformations.length != transformationNames.length) return "keyframe must have 5 transformations (translation, rotation z, rotation y, rotation x, scale)";
        for (let k = 0; k < transformations.length; k++) {
            if (transformations[k].nodeName != transformationNames[k]) return "keyframe must have a " + transformationNames[k] + " transformation in index " + k;
        }

        let transfMatrix = mat4.create();

        var coordinates = this.parseCoordinates3D(transformations[0], "translate transformation for animation ID " + animationId);
        if (!Array.isArray(coordinates)) return coordinates;
        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);

        const axisZ = this.reader.getString(transformations[1], 'axis', false);
        if (axisZ == null || axisZ != "z") return "unable to parse axis of the rotate z transformation for animation ID " + animationId;
        const angleZ = this.reader.getFloat(transformations[1], 'angle', false);
        if (!(angleZ != null && !isNaN(angleZ))) return "unable to parse angle of the rotate z transformation for animation ID " + animationId;
        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angleZ*DEGREE_TO_RAD, [0, 0, 1]);
        
        const axisY = this.reader.getString(transformations[2], 'axis', false);
        if (axisY == null || axisY != "y") return "unable to parse axis of the rotate y transformation for animation ID " + animationId;
        const angleY = this.reader.getFloat(transformations[2], 'angle', false);
        if (!(angleY != null && !isNaN(angleY))) return "unable to parse angle of the rotate y transformation for animation ID " + animationId;
        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angleY*DEGREE_TO_RAD, [0, 1, 0]);

        const axisX = this.reader.getString(transformations[3], 'axis', false);
        if (axisX == null || axisX != "x") return "unable to parse axis of the rotate x transformation for animation ID " + animationId;
        const angleX = this.reader.getFloat(transformations[3], 'angle', false);
        if (!(angleX != null && !isNaN(angleX))) return "unable to parse angle of the rotate x transformation for animation ID " + animationId;
        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angleX*DEGREE_TO_RAD, [0, 1, 0]);

        coordinates = this.parseCoordinates3D(transformations[4], "scale transformation for animation ID " + animationId, ["sx", "sy", "sz"]);
        if (!Array.isArray(coordinates)) return coordinates;
        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);

        myKeyframeAnimation.addKeyframe(instant, transfMatrix);
    }

}