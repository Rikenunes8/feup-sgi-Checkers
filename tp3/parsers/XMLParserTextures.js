import { CGFtexture } from '../../lib/CGF.js';
import { XMLParser } from './XMLParser.js';

export class XMLParserTextures extends XMLParser {
    constructor(scene) {
        super(scene);
    }
    /**
     * Parses the <textures> block. 
     * @param {textures block element} node
     */
    parse(node) {
        var children = node.children;

        // object with textureId associated with texture
        this.scene.textures = {};

        for (let i = 0 ; i < children.length; i++) {
            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current texture.
            const textureId = this.reader.getString(children[i], 'id', false);
            if (textureId == null) 
                return "no ID defined for texture " + (i+1);
            // Checks for repeated IDs.
            if (this.scene.textures[textureId] != null)
                return "ID must be unique for each texture (conflict: ID = " + textureId + ")";
            
            // Get file path of the current texture.
            const textureFile = this.reader.getString(children[i], 'file', false);
            if (textureFile == null) 
                return "no File defined for texture " + textureId;
            // Checks for file extension
            if (textureFile.match(/.*\.(png|jpg)/) == null)
                return "File defined for texture " + textureId + " must be in .png or .jpg format";

            this.scene.textures[textureId] = new CGFtexture(this.scene.scene, textureFile);
        }

        if (Object.keys(this.scene.textures).length === 0)
            return "at least one texture must be defined";
            
        this.log("Parsed textures");
        return null;
    }
}