import { XMLParser, DEGREE_TO_RAD} from './XMLParser.js';
import { MyComponent } from '../components/MyComponent.js';

export class XMLParserComponents extends XMLParser {
    constructor(scene) {
        super(scene);
    }

   /**
   * Parses the <components> block.
   * @param {components block element} node
   */
    parse(node) {
        var children = node.children;

        // object with id of component associated with its properties
        this.scene.components = {};
        this.scene.highlightedComponents = [];
        var grandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id', false);
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.scene.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");
            var highlightedIndex = nodeNames.indexOf("highlighted");

            if (transformationIndex == -1) return "missing tranformation definition in component " + componentID;
            if (materialsIndex == -1) return "missing materials definition in component " + componentID;
            if (textureIndex == -1) return "missing texture definition in component " + componentID;
            if (childrenIndex == -1) return "missing children definition in component " + componentID;

            let componentTransfMatrix = this.parseComponentTransformations(grandChildren[transformationIndex].children, componentID)
            let componentMaterials = this.parseComponentMaterials(grandChildren[materialsIndex].children, componentID);
            let componentTexture = this.parseComponentTexture(grandChildren[textureIndex], componentID);
            let componentChildren = this.parseComponentChildren(grandChildren[childrenIndex].children, componentID);
            let componentHighlighted = highlightedIndex != -1 ? this.parseComponentHighlighted(grandChildren[highlightedIndex], componentID) : null;

            if (!Array.isArray(componentTransfMatrix)) return componentTransfMatrix;
            if (!Array.isArray(componentMaterials)) return componentMaterials;
            if (!Array.isArray(componentTexture) && componentTexture != 'none' && componentTexture != 'inherit') return componentTexture;
            if (!Array.isArray(componentChildren)) return componentChildren;
            if (componentHighlighted != null && !Array.isArray(componentHighlighted)) return componentHighlighted;
            
            let newComponent = new MyComponent(this.scene.scene, componentID, componentTransfMatrix, componentMaterials, componentTexture, componentChildren, componentHighlighted);
            this.scene.components[componentID] = newComponent;
            if (componentHighlighted) {
                this.scene.highlightedComponents.push(newComponent);
            }
        }

        this.log("Parsed components");
        return null;
    }

    /**
     * Parse the transformations for a componentId
     * @param {*} transformations 
     * @param {*} componentID 
     * @returns list with transformations
     */
    parseComponentTransformations(transformations, componentID) {
        let transfMatrix = undefined;

        let transformationNames = [];
        for (let child of transformations) 
            transformationNames.push(child.nodeName);

        if (transformationNames.includes('transformationref')) {
            if (transformations.length === 1) {
                const transformationrefId = this.reader.getString(transformations[0], 'id', false);
                if (transformationrefId == null) return "no ID defined for transformationref defined in component " + componentID;

                if (this.scene.transformations[transformationrefId] == null) return "no transformation defined with ID " + transformationrefId;

                transfMatrix = this.scene.transformations[transformationrefId]
            }
            else 
                return  "transformationref must be a single definition inside transformation block of component " + componentID; 
        } else {
            transfMatrix = mat4.create();

            for (var j = 0; j < transformations.length; j++) {
                switch (transformations[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(transformations[j], "translate transformation for component ID " + componentID);
                        if (!Array.isArray(coordinates)) return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(transformations[j], "scale transformation for component ID " + componentID);
                        if (!Array.isArray(coordinates)) return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'rotate':
                        // angle
                        let angle = this.reader.getFloat(transformations[j], 'angle', false);
                        if (!(angle != null && !isNaN(angle))) return "unable to parse angle of the rotate transformation for component ID " + componentID;

                        // axis
                        const axisNames = ['x', 'y', 'z']
                        let axisArr = [0, 0, 0];
                        
                        const axis = this.reader.getString(transformations[j], 'axis', false);
                        if (axis == null)return "unable to parse axis of the rotate transformation for component ID " + componentID;

                        const index = axisNames.indexOf(axis);
                        if (index !== -1) axisArr[index] = 1;
                        else return "unable to parse axis of the rotate transformation for component ID " + componentID + "; the axis should belong to {x,y,z} instead of " + axis;


                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle*DEGREE_TO_RAD, axisArr);
                        break;
                    default:
                        this.onXMLMinorError("unknown tag <" + transformations[j].nodeName + ">");
                        break;
                }
            }
        }
        return [...transfMatrix];
    }

    /**
     * Parses materials for a component ID
     * @param {*} materials 
     * @param {*} componentID 
     * @returns list with all the component materials
     */
    parseComponentMaterials(materials, componentID) {
        let componentMaterials = [];
        for (let j = 0; j < materials.length; j++) {
            if (materials[j].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + materials[j].nodeName + ">");
                continue;
            }

            const materialId = this.reader.getString(materials[j], 'id', false);
            if (materialId == null) return "no ID defined for material defined in component " + componentID;

            if (materialId == 'inherit') {
                componentMaterials.push('inherit');
            } else {
                if (this.scene.materials[materialId] == null) return "no material defined with ID " + materialId;
                componentMaterials.push(this.scene.materials[materialId]);
            }
        }
        if (componentMaterials.length === 0)
            return "must exists at least one material declaration for component " + componentID;

        return [...componentMaterials];
    }

    /**
     * Parses textures for a component
     * @param {*} texture 
     * @param {*} componentID 
     * @returns list with the component texture id and its length_s and length_t 
     */
    parseComponentTexture(texture, componentID) {
        let componentTexture = undefined;
        const textureId = this.reader.getString(texture, 'id', false);
        if (textureId == null) return "no ID defined for texture defined in component " + componentID;

        if (textureId == 'none') {
            componentTexture = ['none', 1, 1];
        } else if (textureId == 'inherit') {
            componentTexture = ['inherit', 1, 1];
        } else {
            if (this.scene.textures[textureId] == null) return "no texture defined with ID " + textureId;

            const length_s = this.reader.getFloat(texture, 'length_s', false);
            const length_t = this.reader.getFloat(texture, 'length_t', false);
            
            if (length_s == null) this.onXMLMinorError("no length_s defined for texture " + textureId + " in component " + componentID); 
            if (length_t == null) this.onXMLMinorError("no length_t defined for texture " + textureId + " in component " + componentID);
            
            // if (length_s == null) return "no length_s defined for texture " + textureId + " in component " + componentID;
            // if (length_t == null) return "no length_t defined for texture " + textureId + " in component " + componentID;
            
            componentTexture = [textureId, length_s ?? 1, length_t ?? 1];
        }
        return componentTexture;
    }

    /**
     * Parses the children of a component
     * @param {*} children 
     * @param {*} componentID 
     * @returns array with the children of the component (primitives and components)
     *         each child is represented by an array with the child type and its id
     */
    parseComponentChildren(children, componentID) {
        let componentChildren = [];
        for (let j = 0; j < children.length; j++) {
            if (children[j].nodeName == "primitiveref") {
                const childPrimitiveId = this.reader.getString(children[j], 'id', false);
                if (childPrimitiveId == null)
                    return "no ID defined for child primitive defined in component " + componentID;
                if (this.scene.primitives[childPrimitiveId] == null) {
                    return "no primitive defined with ID " + childPrimitiveId;
                }
                componentChildren.push([true, childPrimitiveId]);
            } else if (children[j].nodeName == "componentref") {
                const childComponentId = this.reader.getString(children[j], 'id', false);
                if (childComponentId == null)
                    return "no ID defined for child component defined in component " + componentID;
                componentChildren.push([false, childComponentId]);
            } else {
                this.onXMLMinorError("unknown tag <" + children[j].nodeName + ">");
                continue;
            }
        }
        if (componentChildren.length === 0)
            return "must exists at least one children declaration for component " + componentID;

        return [...componentChildren];
    }

    parseComponentHighlighted(highlighted, componentID) {
        const r = this.reader.getFloat(highlighted, 'r', false);
        const g = this.reader.getFloat(highlighted, 'g', false);
        const b = this.reader.getFloat(highlighted, 'b', false);
        const h = this.reader.getFloat(highlighted, 'scale_h', false);

        if (r == null) return "no r defined for highlighted color in component " + componentID;
        if (g == null) return "no g defined for highlighted color in component " + componentID;
        if (b == null) return "no b defined for highlighted color in component " + componentID;
        if (h == null) return "no scale_h defined for highlighted color in component " + componentID;

        return [r, g, b, h];
    }
}