import React from "react";
import {CanvasPanelProps} from "../types";
import {ECS} from "./EntityComponentSystem";
import {SceneManager} from "./SceneManager";
import config from "../config/config.json";
import {RenderManager} from "./RenderManager";

/**
 * CanvasContextManager is a singleton class designed to manage the creation, deletion,
 * and manipulation of multiple canvas panels. 
 * It provides utility methods to handle the lifecycle of canvas panels, associate them with scenes, and
 * trigger updates when necessary.
 */
export class CanvasContextManager {
    private static _instance: CanvasContextManager | null = null; // Singleton instance
    private _canvasPanels: Array<CanvasPanelProps>; // List of canvas panel data objects
    private _currentCanvasId: number | null = null; // Store the `id` of the current canvas
    private static readonly MAX_CANVASES: number = config.MAX_CANVASES;


    /**
     * A private variable that stores a callback function to be executed
     * whenever the canvas updates.
     */
    private _onCanvasUpdate: (() => void) | null = null;
    // Allow external components to subscribe to updates
    public setCanvasUpdateCallback(callback: () => void): void {
        this._onCanvasUpdate = callback;
    }

    /**
     * Triggers an update of the canvas
     */
    public triggerCanvasUpdate(): void {
        if (this._onCanvasUpdate) {
            this._onCanvasUpdate(); // Notify subscribers
        }
    }
    private constructor() {
        this._canvasPanels = [];
        this.createCanvasPanel({
            id: ECS.getInstance().createEntity(),
            BgColor: config.BG_COLOR,
            canvasRef: React.createRef<HTMLCanvasElement | null>(),
        });
    }

    /**
     * Returns the singleton instance of the CanvasContextManager.
     * Ensures that only one instance of the CanvasContextManager is created and reused.
     *
     * @return {CanvasContextManager} The singleton instance of the CanvasContextManager.
     */
    public static getInstance(): CanvasContextManager {
        if (!this._instance) {
            this._instance = new CanvasContextManager();
        }
        return this._instance;
    }


    /**
     * Reloads a canvas panel with the given entity ID, background color, and optional scene ID.
     * Creates a new canvas and associates it with a scene if certain conditions are met.
     *
     * @param {number} entId - The unique identifier for the canvas entity.
     * @param {string} bgCol - The background color for the canvas panel.
     * @param {number|null} sceneId - The optional scene identifier to associate with the canvas.
     *                                If null, a new scene will be created.
     * @return {number|null} The ID of the created canvas entity if successful, otherwise null.
     */
    reloadCanvasPanel( entId: number, bgCol:string, sceneId:number|null ): number | null
    {
        if (this._canvasPanels.length >= CanvasContextManager.MAX_CANVASES) {
            return null;
        }
        const props : CanvasPanelProps = {
            BgColor: config.BG_COLOR, // Dynamic background color for the canvas
            id:entId,
            canvasRef: React.createRef<HTMLCanvasElement | null>() // Optional React ref for the canvas element
        }
        // Attempt to create the scene to this canvas first
        sceneId = SceneManager.getInstance().createSceneForCanvas(props.id,sceneId);

        if (sceneId === null) {
            window.addToast?.("Failed to create or associate a scene for canvas.", "error");
            return null;
        }

        // If scene creation succeeded, add the canvas to the list
        this._canvasPanels.push(props);
        this.setCurrentCanvasById(props.id);

        window.addToast?.(`Canvas "${props.id}" created with associated scene "${sceneId}".`, "info");
        return props.id;
    }

    /**
     * Creates a new canvas panel with the specified properties and associates it with a scene.
     *
     * @param {CanvasPanelProps} props - The properties of the canvas panel to be created, including the canvas ID.
     * @return {number | null} The ID of the created canvas panel if successful, or null if the canvas could not be created or associated with a scene.
     */
    public createCanvasPanel(props: CanvasPanelProps): number | null {
        if (this._canvasPanels.length >= CanvasContextManager.MAX_CANVASES) {
            window.addToast?.("Maximum number of canvases reached.", "info");
            return null;
        }

        // Attempt to create the scene to this canvas first
        const sceneId = SceneManager.getInstance().createSceneForCanvas(props.id);
        
        if (sceneId === null) {
            window.addToast?.("Failed to create or associate a scene for canvas.", "error");
            return null;
        }
        
        // If scene creation succeeded, add the canvas to the list
        this._canvasPanels.push(props);
        this.setCurrentCanvasById(props.id);
        window.addToast?.(`Canvas "${props.id}" created with associated scene "${sceneId}".`, "success");
        return props.id;
    }

    /**
     * Retrieves an array of canvas panel properties.
     *
     * @return {CanvasPanelProps[]} An array containing the canvas panel properties.
     */
    public getCanvasPanels(): Array<CanvasPanelProps> {
        return this._canvasPanels;
    }

    /**
     * Sets the current canvas by its unique identifier.
     *
     * @param {number} id - The unique identifier of the canvas to be set as current.
     * @throws {Error} If a canvas with the given ID does not exist.
     */
    public setCurrentCanvasById(id: number):void {
        const exists = this._canvasPanels.some((panel) => panel.id === id);
        if (!exists) {
            throw new Error(`Canvas with id ${id} does not exist.`);
        }
        if(this._currentCanvasId === id)
            return;
        RenderManager.stopAnimation();
        this._currentCanvasId = id;
        //window.addToast?.(`Canvas "${id}" set as current.`, "success");
        try{
            SceneManager.getInstance().updateCurrentSceneByCanvasId(id);
            this.triggerCanvasUpdate();
        }catch (e:any) {
            window.addToast?.(e.message, "error");
        }
    }
    /**
     * Retrieves the currently active canvas panel based on the stored current canvas ID.
     * If no canvas matches the current ID, or if the current ID is null, null is returned.
     *
     * @return {CanvasPanelProps | null} The currently active canvas panel, or null if no canvas matches or the current ID is null.
     */
    public getCurrentCanvasPanel(): CanvasPanelProps | null {
        if (this._currentCanvasId === null) {
            return null;
        }
        return this._canvasPanels.find((panel) => panel.id === this._currentCanvasId) || null;
    }

    /**
     * Retrieves the 2D rendering context of the current canvas panel, if available.
     *
     * @return {CanvasRenderingContext2D | null} The 2D rendering context of the current canvas or null if unavailable.
     */
    public getCurrentCanvasContext(): CanvasRenderingContext2D | null {
        const currentPanel = this.getCurrentCanvasPanel();
        if (!currentPanel) {
            window.addToast?.("No current canvas is set.", "error");
            return null;
        }
        const canvasElement = currentPanel.canvasRef.current;
        return canvasElement ? canvasElement.getContext("2d") : null;
    }
    
    /**
     * Retrieves the current canvas element from the active canvas panel.
     *
     * @return {HTMLCanvasElement | null} The current canvas element if available; otherwise, null.
     */
    public getCurrentCanvas(): HTMLCanvasElement | null {
        const currentPanel = this.getCurrentCanvasPanel();
        if (!currentPanel) {
            window.addToast?.("No current canvas is set.", "error");
            return null;
        }
        return currentPanel.canvasRef.current;
    }
    
    /**
     * Clears all canvas panels and their associated entities, resets the internal
     * canvas panel list, and sets the current canvas ID to null.
     */
    clear(): void
    {
        const ecs = ECS.getInstance();
        this._canvasPanels.forEach((panel) => {
            panel.canvasRef.current?.getContext("2d")?.clearRect(0, 0, panel.canvasRef.current?.width, panel.canvasRef.current?.height);
            ecs.deleteEntity(panel.id);
            
        });
        this._canvasPanels = [];
        this._currentCanvasId = null;
        
    }
}