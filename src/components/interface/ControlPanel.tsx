import React, { Component } from "react";
import { ControlManager } from "../../logic/ControlManager";
import { ControlManagerState } from "../../types";
import config from "../../config/config.json";
import {RenderManager} from "../../logic/RenderManager";
import {CanvasContextManager} from "../../logic/CanvasContextManager";
import {SceneManager} from "../../logic/SceneManager";

/**
 * The ControlPanel is the interface for the control buttons
 *
 * Responsibilities include:
 * - Adding rectangles to the scene.
 * - Playing animations based on a configurable duration.
 * - Handling user input for animation duration and validating it.
 * - Downloading a project as a JSON file.
 * - Browsing and loading JSON files to update the application's state.
 * Works with the ControlManager
 */
export class ControlPanel extends Component<{}, ControlManagerState> {
    private readonly _fileInputRef: React.RefObject<HTMLInputElement| null> ;

    constructor(props: any) {
        super(props);

        this.handleLoadJsonFile = this.handleLoadJsonFile.bind(this);
        this._fileInputRef = React.createRef<HTMLInputElement>();

        this.state = {
            duration: config.DEFAULT_DURATION,
            isInputValid: false
        };
    }

    /**
     * Handles adding a rectangle to the scene.
     */
    handleAddRectangle = (): void => {
        ControlManager.handleAddRectangle();
    };

    /**
     * Plays the animation for the current scene.
     */
    handlePlayAnimation = (): void => {
        const { duration, isInputValid } = this.state;

        if (!duration || isInputValid) {
            window.addToast?.("Please enter a valid duration.", "error");
            return;
        }
        ControlManager.handlePlayAnimation(duration);
    };

    /**
     * Handles input change for duration field.
     * Updates duration and validates the input.
     * @param event - The input change event.
     */
    handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const duration = Number(event.target.value);

        // Validate duration input
        if (isNaN(duration) || duration < 0) {
            this.setState({ isInputValid: true, duration });
        } else {
            this.setState({ isInputValid: false, duration });
        }
    };

    /**
     * Downloads the project as a JSON file.
     */
    handleDownloadJson = (): void => {
        const { duration } = this.state;
        ControlManager.handleDownloadJson(duration);
    };

    /**
     * Simulates a file browser click to allow uploading JSON files.
     */
    handleBrowseFiles = (): void => {
        this._fileInputRef.current?.click();
    };

    /**
     * Handles loading a JSON file, updates state with content.
     * @param event - The file input change event.
     */
    async handleLoadJsonFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const duration = await ControlManager.handleLoadJsonFile(file);
            const ctx = CanvasContextManager.getInstance().getCurrentCanvasContext();
            const scene = SceneManager.getInstance().getCurrentScene();
            this.setState({duration: duration}); // Update state with loaded duration
            if(!ctx || !scene) return;
            RenderManager.Render(scene, ctx);
            //console.log(`Loaded file with duration: ${duration}s`);
        } catch (error:any) {
            window.addToast?.(error.message, "error");
        }finally {
            event.target.value = "";
        }
    }

    /**
     * Renders the component UI.
     */
    render(): React.ReactElement {
        const { duration, isInputValid } = this.state;

        return (
            <div className="ControlPanel">
                <button onClick={this.handleAddRectangle}>Add Rectangle</button>
                <input
                    type="number"
                    placeholder="Enter animation duration in seconds"
                    className={`numberInput ${isInputValid ? "invalid" : ""}`}
                    value={duration}
                    onChange={this.handleDurationChange}
                />
                <button onClick={this.handlePlayAnimation}>Play Animation</button>
                <button onClick={this.handleDownloadJson}>Download Project</button>
                <button onClick={this.handleBrowseFiles}>Browse Files</button>
                <input
                    style={{ display: "none" }}
                    ref={this._fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={this.handleLoadJsonFile}
                />
            </div>
        );
    }
}