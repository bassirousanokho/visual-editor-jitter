import Utils from "../utils/utils";
import { SceneManager } from "./SceneManager";
import { CanvasContextManager } from "./CanvasContextManager";
import { RenderManager } from "./RenderManager";
import { ShapeFactory } from "./ShapeFactory";
import {ECS} from "./EntityComponentSystem";


/**
 * The ControlManager is the controller for the control panel
 * Implements all the callbacks of the control panel 
 */
export class ControlManager {
    /**
     * Adds a new rectangle to the current scene and renders it to the canvas.
     */
    static handleAddRectangle(): void {
        const scene = SceneManager.getInstance().getCurrentScene();
        const canvas = CanvasContextManager.getInstance().getCurrentCanvas();
        const context = CanvasContextManager.getInstance().getCurrentCanvasContext();

        if (!scene || !canvas || !context) return;

        const { pos, rectSize } = Utils.GetPositionAndSizeWithinBounds(canvas);
        try {
            scene.addShape(ShapeFactory.createShape("Rectangle", pos, rectSize, Utils.randomOrientation(), Utils.randomColor()));
            RenderManager.Render(scene, context);
        }catch (e:any) {
            window.addToast?.(e.message, "error");
        }
    }

    /**
     * Plays the animation for the current scene with the given duration.
     * @param duration - Animation duration in seconds.
     */
    static handlePlayAnimation(duration: number): void {
        const scene = SceneManager.getInstance().getCurrentScene();
        const context = CanvasContextManager.getInstance().getCurrentCanvasContext();

        if (!scene || !context) {

            window.addToast?.("No scene or no contex to render!", "error");
            return;
        }
        RenderManager.playAnimation(scene, duration * 1000);
    }

    /**
     * Exports the current scene and duration into a downloadable JSON file.
     * @param duration - The current animation duration to save.
     */
    static handleDownloadJson(duration: number): void {
        const data = SceneManager.getInstance().serialize();
        const exportData = {
            data,
            duration,
        };
        Utils.downloadFile(JSON.stringify(exportData,null,2), "canvas-data.json", "application/json");
    }

    /**
     * Reads a JSON file and returns parsed data.
     * @param file - JSON file to read.
     */
    static async handleLoadJsonFile(file: File): Promise<number> {
        const content = await Utils.readFile(file);
        const data = JSON.parse(content);

        // Validate data structure
        this.validateJsonData(data);

        // Clear managers (SceneManager, ECS, CanvasContextManager)
        this.clearManagers();

        // Process canvas-scene mappings and construct scenes
        this.processCanvasSceneMappings(data.data.canvasSceneMapping, data.data.scenes);
        
        //set ECS max entity ID
        const ecsInstance = ECS.getInstance();
        if (ecsInstance) {
            ecsInstance.nextEntityId = data.data.ecs.maxEntityId;
        }
        CanvasContextManager.getInstance().triggerCanvasUpdate();
        RenderManager.stopAnimation();
        return data.duration;
    }


    /**
     * Validates the structure and required fields of the JSON data.
     * Throws an error if any required field is missing or invalid.
     *
     * @param {any} data The JSON data to validate.
     * @throws {Error} If 'duration' is missing or invalid, or if required nested fields are missing.
     */
    static validateJsonData(data: any): void {
        if (typeof data.duration !== "number" || data.duration < 0) {
            throw new Error("load aborted: 'duration' field is missing or invalid!");
        }
        const requiredFields = ["data", "data.scenes", "data.canvasSceneMapping","data.ecs"];
        for (const fieldPath of requiredFields) {
            const [parent, child] = fieldPath.split(".");
            if (child ? !data[parent]?.[child] : !data[fieldPath]) {
                throw new Error(`load aborted: '${fieldPath}' field is missing!`);
            }
        }
        for (const sceneId in data.data.scenes) {
            if (!data.data.scenes[sceneId].shapes) {
                throw new Error("load aborted: 'shapes' field in scenes is missing!");
            }
        }
    }

    /**
     * Clears all managers including SceneManager, ECS, and CanvasContextManager by invoking their respective clear methods.
     */
    static clearManagers(): void {
        SceneManager.getInstance().clear();
        const ecs = ECS.getInstance();
        if (ecs) ecs.clear();
        CanvasContextManager.getInstance().clear();
    }

    /**
     * Processes the mapping between canvas IDs and scene IDs, updating canvas panels and populating scenes with shapes.
     *
     * @param {Record<string, number>} canvasSceneMapping - A mapping of canvas IDs (as strings) to scene IDs.
     * @param {Record<number, any>} scenes - A mapping of scene IDs to scene details, including shape data.
     */
    static processCanvasSceneMappings(canvasSceneMapping: Record<string, number>, scenes: Record<number, any>): void {
        const ctxManager = CanvasContextManager.getInstance();
        for (const canvasIdString in canvasSceneMapping) {
            const sceneId = canvasSceneMapping[canvasIdString];
            ctxManager.reloadCanvasPanel(Number(canvasIdString), "Red", sceneId);

            const sceneDetails = scenes[sceneId];
            const scene = SceneManager.getInstance().getScene(sceneId);
            if (!scene) continue;

            // Sort shapes by zIndex and add to scene
            sceneDetails.shapes.sort((a: any, b: any) => a.zindex - b.zindex);
            for (const shapeData of sceneDetails.shapes) {
                scene.addShape(
                    ShapeFactory.createShape(
                        shapeData.type,
                        shapeData.position,
                        shapeData.size,
                        shapeData.orientation,
                        shapeData.color
                    )
                );
            }
        }
    }
}