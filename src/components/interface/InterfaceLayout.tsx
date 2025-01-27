import React, {JSX} from "react";
import "./InterfaceLayout.css"; // Import the CSS for styling
import { ControlPanel } from "./ControlPanel";
import {CanvasPanelProps, InterfaceLayoutProps} from "../../types";
import { CanvasContextManager } from "../../logic/CanvasContextManager";
import { CanvasPanel } from "./CanvasPanel";
import { RenderManager } from "../../logic/RenderManager";
import { SceneManager } from "../../logic/SceneManager";

/**
 * InterfaceLayout is a React component responsible for managing and rendering canvas panels within
 * a user interface. It listens for window resize events to ensure that the canvases are resized
 * dynamically based on their parent container's dimensions and device pixel ratio (DPR). The layout
 * includes a left panel for canvases and a fixed-width right panel for controls.
 *
 * It can manage multiple canvases through the CanvasContextManager
 *
 * Key Features:
 *   - Dynamically resizable and scalable canvas panels based on window size and DPR.
 *   - Two-panel layout: Left panel for canvases and right panel for controls.
 *
 * State:
 * - canvasPanels: Manages the array of canvas panels, each containing properties like ID, background color, and reference.
 */

export class InterfaceLayout extends React.Component<InterfaceLayoutProps, { canvasPanels: CanvasPanelProps[] }> {
    private _panelLayout: InterfaceLayoutProps;
    
    constructor(props: InterfaceLayoutProps) {
        super(props);
        // Initialize properties
        this._panelLayout = props; // Store layout props
        this.resizeAndRenderCanvasPanels = this.resizeAndRenderCanvasPanels.bind(this); // Bind the event handler
        this.state = {
            canvasPanels: CanvasContextManager.getInstance().getCanvasPanels(), // Initialize from the manager
        } as { canvasPanels: CanvasPanelProps[] };
        
    }

    
    /**
     * Removes the "resize" event listener attached to the window object.
     */
    componentWillUnmount(): void {
        window.removeEventListener("resize", this.resizeAndRenderCanvasPanels);
    }

    /**
     * Adds the "resize" event listener to the window object.
     * Creates the canvases 
     */
    componentDidMount(): void {
        const canvasManager = CanvasContextManager.getInstance();

        // Set up the canvas update callback
        canvasManager.setCanvasUpdateCallback(() => {
            this.setState({ canvasPanels: canvasManager.getCanvasPanels() }, () => {
                this.processCanvasPanels(); // Process canvases after state update
            });
        });

        // Initial render of canvases
        this.processCanvasPanels();

        // Add resize event listener for canvases
        window.addEventListener("resize", this.resizeAndRenderCanvasPanels);
    }

    /**
     * Processes the canvas panels by resizing and rendering them.
     */
    private processCanvasPanels(): void {
        this.state.canvasPanels.forEach((panel) => {
            const canvas = panel.canvasRef?.current;
            const parentRect = canvas?.parentElement?.getBoundingClientRect();

            if (canvas && parentRect) {
                this.resizeCanvas(canvas, parentRect); // Adjust dimensions
                this.renderCanvas(panel.id, canvas); // Render the canvas
            }
        });
    }

    /**
     * Handles resize events and re-renders canvas panels appropriately.
     */
    private readonly resizeAndRenderCanvasPanels = (): void => {
        this.processCanvasPanels();
    };

    /**
     * Resizes the given canvas element based on the dimensions of the parent rectangle
     * and the device pixel ratio (DPR).
     * @param {HTMLCanvasElement} canvas - The canvas element to be resized.
     * @param {DOMRect} parentRect - The dimensions of the parent container to use for resizing.
     */
    private resizeCanvas(canvas: HTMLCanvasElement, parentRect: DOMRect): void {
        const dpr = 1.0;//window.devicePixelRatio || 1;
        canvas.width = parentRect.width * dpr;
        canvas.height = parentRect.height * dpr;
        //console.log(`Canvas resized to: ${canvas.width}x${canvas.height} (DPR: ${dpr}).`);
    }

    /**
     * Renders the specified scene onto the given canvas element.
     *
     * @param {number} canvasId - The unique identifier for the canvas.
     * @param {HTMLCanvasElement} canvas - The canvas element where the scene will be rendered.
     */
    private renderCanvas(canvasId: number, canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext("2d");
        const scene = SceneManager.getInstance().getSceneForCanvas(canvasId);

        if (ctx && scene) {
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformations
            const dpr =1.0; /*window.devicePixelRatio || 1;*/
            ctx.scale(dpr, dpr);
            RenderManager.Render(scene, ctx);
        }
    }

    /**
     * Renders the canvas panels managed by the CanvasContextManager.
     * @returns {JSX.Element[]} An array of JSX elements representing the canvas panels.
     */
    renderCanvasPanels(): JSX.Element[] {
        return this.state.canvasPanels.map((panel, index) => (
            <div key={index} className="CanvasContainer">
                <CanvasPanel
                    id={panel.id}
                    BgColor={panel.BgColor}
                    canvasRef={panel.canvasRef}
                />
            </div>
        ));
    }

    /**
     * Render a left panel and a right panel
     */
    render(): JSX.Element {
        return (
            <div className="App">
                <div className="App-header">
                    <div className="LeftPanel"> {/* Canvases fill this container */}
                        {this.renderCanvasPanels()}
                    </div>
                    <div
                        className="RightPanel"
                        style={{flex: `0 0 ${this._panelLayout.rightPanelFixedWidth}px`}}
                    >
                        <ControlPanel/>
                    </div>
                </div>
            </div>
        );
    }
}