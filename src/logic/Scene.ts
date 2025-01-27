import {Shape} from "../Geometry/Shape";
import {ECS} from "./EntityComponentSystem";

/**
 * Represents a graphical scene that can manage and render shapes. Each scene has a unique identifier
 * and is used to contain and organize shapes along with their z-index information.
 * A scene is associated to a canvas. It must not be dereferenced out of canvasContextManager 
 */
export class Scene {
    // Properties
    private readonly _shapes: Map<number, Shape>; // Map to store shapes with their associated IDs
    private _zBuffer: Map<number, number>; // Map to store the z-index of each shape useful to know who is on top
    private readonly _name: string;              // The name of the scene (identifier)
    private readonly _entityId: number;
    private _zindexLast:number;
    
    // Constructor
    constructor(sceneName: string,sceneId?:number|null) {
        this._name = sceneName;
        this._shapes = new Map<number, Shape>();
        if(sceneId) this._entityId = sceneId;
        else this._entityId = ECS.getInstance().createEntity();
        this._zindexLast = 0;
        this._zBuffer = new Map<number, number>();
    }
    
    /**
     * Retrieves the unique identifier for the entity.
     *
     * @return {number} The numeric ID representing the entity.
     */
    get entityID():number {
        return this._entityId;
    }
    
    /**
     * Adds a shape to the current scene. Each shape must have a unique entity ID to be added.
     * @param {Shape} shape - The shape object to be added to the scene.
     * @throws {Error} If a shape with the same entity ID already exists in the scene.
     */
    addShape(shape: Shape): void {
        const id = shape.entityID;
        if (this._shapes.has(id)) 
        {
            throw new Error(`Shape with ID ${id} already exists in scene "${this._name}".`);
        }
        this._shapes.set(id, shape);
        shape.setZIndex(this._zindexLast++);
        this._zBuffer.set(id, shape.getZIndex());
    }
    
    /**
     * Retrieves the shape associated with the given identifier.
     *
     * @param {number} id - The unique identifier of the shape to retrieve.
     * @return {Shape | undefined} The shape object if found, otherwise undefined.
     */
    getShape(id: number): Shape | undefined {
        return this._shapes.get(id);
    }
    
    /**
     * Retrieves a map of shapes.
     *
     * @return {Map<number, Shape>} A map where the key is a number representing the shape's identifier and the value is the corresponding Shape object.
     */
    getShapes(): Map<number, Shape> {
        return this._shapes;
    }
    
    /**
     * Retrieves the IDs of shapes sorted in descending order based on their z-index value.
     *
     * @return {Array<number>} An array of shape IDs sorted by their z-index in descending order.
     */
    getShapesIdByDescendingZIndex(): Array<number> {
        // Convert the Map to an array of [key, value] pairs
        const entries = Array.from(this._zBuffer.entries());

        // Sort the array by the second element (value) in descending order
        entries.sort((a, b) => b[1] - a[1]); // Sort by values descending

        // Map the sorted array to only extract the keys
        return entries.map(([key]) => key);
    }

    /**
     * Serializes the current instance into a plain JavaScript object.
     *
     * @return {object} A serialized representation of the instance, including the shapes as an array of their serialized forms.
     */
    serialize(): object {
        return {
            shapes: Array.from(this.getShapes().values()).map((shape:Shape) => shape.serialize()),
        };
    }

    /**
     * Removes all shapes from the canvas, clears the internal shapes collection and z-buffer,
     * and deletes the associated entity from the ECS system.
     */
    clear():void {
        this._shapes.forEach((shape) => {shape.remove()});
        this._shapes.clear();
        this._zBuffer.clear();
        ECS.getInstance().deleteEntity(this._entityId);
    }
    
}