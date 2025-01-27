import React, {JSX} from "react";
import {CanvasPanelProps} from "../../types";
import {CanvasManager} from "../../logic/CanvasManager";
import {CanvasContextManager} from "../../logic/CanvasContextManager";
import {RenderManager} from "../../logic/RenderManager";
import {SceneManager} from "../../logic/SceneManager";

/**
 * A React component that represents a canvas element.
 * This component renders the canvas
 * This is an entity the ECS keeps track of it.
 */
export class CanvasPanel extends React.Component<CanvasPanelProps> {
    private _canvasManager : CanvasManager;
    constructor(props: CanvasPanelProps) {
        super(props);
        this._canvasManager = new CanvasManager();
    }
    /**
     * Focused on this canvas.
     * This method uses the CanvasContextManager to update the current active canvas.
     */
    private setFocus():void {
        CanvasContextManager.getInstance().setCurrentCanvasById(this.props.id);
    }
    componentDidMount(): void {
        const canvas = this.props.canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;
        const scene = SceneManager.getInstance().getSceneForCanvas(this.props.id);
        if (!scene) return;
        RenderManager.Render(scene, context);
    }
    
    render(): JSX.Element {
        return (
            <canvas
                ref={this.props.canvasRef}
                id={String(this.props.id)}
                style={{
                    backgroundColor: this.props.BgColor, // Dynamic background color
                }}
                onMouseDown={(e):void=> {
                    this.setFocus();
                    this._canvasManager.handleCanvasClick(e)
                }}
            ></canvas>
        );
    }
}