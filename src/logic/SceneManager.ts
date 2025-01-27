import { Scene } from "./Scene";
import {ECS} from "./EntityComponentSystem";

/**
 * Manages the creation, retrieval, and association of scenes within an application.
 * Provides functionality to manage scenes, associate them with canvases, and
 * retrieve serialized forms of the managed data.
 *
 * This class enforces a singleton pattern to ensure only one instance is shared
 * across the application.
 */
export class SceneManager {
    private static _instance: SceneManager | null = null; // Holds the singleton instance
    private readonly _scenes: Map<number, Scene>;
    private _currentScene: Scene | undefined;
    private readonly _canvasSceneMap: Map<number, number>; // Maps canvas IDs to scene IDs

    // Private constructor to prevent direct instantiation
    private constructor() {
        this._scenes = new Map<number, Scene>();
        this._canvasSceneMap = new Map<number, number>();
    }

    /**
     * Retrieves the singleton instance of the SceneManager class.
     * If the instance does not already exist, it creates a new one.
     *
     * @return {SceneManager} The singleton instance of SceneManager.
     */
    public static getInstance(): SceneManager {
        if (!this._instance) {
            this._instance = new SceneManager();
        }
        return this._instance;
    }

    
    /**
     * Creates a new scene with a unique name based on the current timestamp and stores it in the internal scenes map.
     * The scene is assigned an entity ID upon creation.
     * Logs the creation of the scene to the console.
     * @return {number | null} The entity ID of the newly created scene if successful, or null in case of an error.
     * @param sceneId
     */
    public createScene(sceneId?:number|null): number | null {
        const name = `scene_${Date.now()}`
        const scene = new Scene(name,sceneId);
        this._scenes.set(scene.entityID, scene);
        //console.log(`Scene "${name}" created.`);
        return scene.entityID;
    }


    /**
     * Updates the current scene based on the provided canvas ID.
     *
     * @param {number} canvasId - The ID of the canvas used to determine the current scene.
     * @return {void} This method does not return a value but logs the result of the operation.
     */
    public updateCurrentSceneByCanvasId(canvasId: number): void {
        const sceneId = this._canvasSceneMap.get(canvasId);

        if (sceneId === undefined) {
            throw new Error(`No scene associated with canvas ID ${canvasId}.`);
        }

        this._currentScene = this.getScene(sceneId);
    }
    
    /**
     * Creates a scene and associates it with a given canvas ID.
     *
     * @param {number} canvasId - The unique identifier of the canvas to associate with the scene.
     * @param sceneId
     * @return {number | null} The ID of the created scene if successful, or null if the scene could not be created.
     */
    public createSceneForCanvas(canvasId: number,sceneId?:number| null): number | null {
        if(sceneId)
            this.createScene(sceneId);
        else
            sceneId = this.createScene(); // Call the existing `createScene` logic
        
        if (sceneId) {
            this._canvasSceneMap.set(canvasId, sceneId);
            return sceneId;
        }
        return null;
        
    }


    /**
     * Retrieves the scene associated with a given canvas ID.
     *
     * @param {number} canvasId - The ID of the canvas for which the associated scene is to be retrieved.
     * @return {Scene | undefined} The scene associated with the given canvas ID, or undefined if no scene is associated.
     */
    public getSceneForCanvas(canvasId: number): Scene | undefined {
        const sceneId = this._canvasSceneMap.get(canvasId);
        if (sceneId !== undefined) {
            return this.getScene(sceneId);
        }
        return undefined;
    }

    
    /**
     * Retrieves the scene associated with the specified scene ID.
     *
     * @param {number} sceneId - The unique identifier of the scene to retrieve.
     * @return {Scene | undefined} The scene object if found, or undefined if the scene ID does not exist.
     */
    public getScene(sceneId: number): Scene | undefined {
        return this._scenes.get(sceneId);
    }

    /**
     * Retrieves the currently active scene.
     *
     * @return {Scene | undefined} The current scene if available; otherwise, undefined.
     */
    public getCurrentScene(): Scene | undefined {
        return this._currentScene;
    }

    /**
     * Retrieves the scenes associated with the object.
     *
     * @return {Array} An array containing all the scenes.
     */
    private getScenes(): Map<number, Scene> {
        return this._scenes;
    }
    
    /**
     * Serializes the current object, including scenes, canvas-scene mapping, and the current scene ID, into a structured format.
     *
     * @return {Object} An object containing serialized scenes, canvasSceneMapping, and the ID of the current scene.
     */
    serialize():any
    {
        const scenes: Record<string, object> = {};

        this._scenes.forEach((scene, sceneId) => {
            scenes[sceneId] = scene.serialize();
        });

        return {
            scenes,
            canvasSceneMapping: Object.fromEntries(this._canvasSceneMap),
            currentSceneId: this._currentScene?.entityID,
            ecs: ECS.getInstance()?.serialize()
        };
    }


    /**
     * Clears all scenes, canvas-scene mappings, and resets the current scene.
     *
     * This method iterates over all scenes and clears each one. It then clears the
     * collection of scenes, the canvas-to-scene mapping, and sets the current
     * scene to undefined.
     */
    clear(): void {
        this._scenes.forEach((scene) => {scene.clear()});
        this._scenes.clear();
        this._canvasSceneMap.clear();
        this._currentScene = undefined;
    }
}