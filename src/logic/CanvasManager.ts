import Utils from "../utils/utils";
import {CanvasContextManager} from "./CanvasContextManager";
import {SceneManager} from "./SceneManager";
import {RenderManager} from "./RenderManager";
import React from "react";
import {Scene} from "./Scene";
import {vec2} from "../types";

/**
 * The CanvasManager class is responsible for managing interactions with a canvas element,
 * including handling user input such as clicks, calculating positions, and updating scenes and shapes.
 */
export class CanvasManager {
    

    constructor() {
    }

    /**
     * Handles the click event on the canvas, identifying the clicked shape
     * in the current scene and applying an appropriate effect.
     *
     * @param {React.MouseEvent<HTMLCanvasElement, MouseEvent>} event - The mouse event triggered by clicking on the canvas.
     */
    public handleCanvasClick(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
        const canvasInstance = CanvasContextManager.getInstance();
        const canvas = canvasInstance?.getCurrentCanvas();
        const ctx = canvasInstance?.getCurrentCanvasContext();
        const scene = SceneManager.getInstance().getCurrentScene();

        if (!canvas || !ctx || !scene) return;

        const  scaledMouse = this.calculateMousePosition(event, canvas);

        this.findClickedShapeAndApplyEffect(scene, scaledMouse.x, scaledMouse.y, ctx);
    }

    
    /**
     * Calculates the mouse position on a canvas element in scaled coordinates.
     *
     * @param event The mouse event containing the client's X and Y coordinates.
     * @param canvas The canvas element on which the mouse event occurred.
     * @return An object containing the scaled X and Y coordinates of the mouse relative to the canvas.
     */
    private calculateMousePosition(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>, canvas: HTMLCanvasElement): vec2 {
        const canvasRect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - canvasRect.left;
        const mouseY = event.clientY - canvasRect.top;
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;

        return {
            x: mouseX * scaleX,
            y: mouseY * scaleY,
        };
    }

    /**
     * Finds the shape that was clicked based on the mouse position, applies a random color effect to it,
     * and re-renders the scene.
     *
     * @param {Scene} scene - The current scene containing shapes to check for clicks.
     * @param {number} mouseX - The x-coordinate of the mouse click event.
     * @param {number} mouseY - The y-coordinate of the mouse click event.
     * @param {CanvasRenderingContext2D} ctx - The rendering context used for checking and updating shapes.
     */
    private findClickedShapeAndApplyEffect(scene: Scene, mouseX: number, mouseY: number, ctx: CanvasRenderingContext2D): void {
        const shapes = scene.getShapesIdByDescendingZIndex();

        for (const shapeId of shapes) {
            const shape = scene.getShape(shapeId);

            if (shape && shape.isClicked(mouseX, mouseY, ctx)) {
                shape.setColor(Utils.randomColor());
                RenderManager.Render(scene, ctx);
                break;
            }
        }
    }
}