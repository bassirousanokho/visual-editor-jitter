/* eslint-disable no-unused-vars */
import React from "react";
import { InterfaceLayout } from "./interface/InterfaceLayout";
import {ECS} from "../logic/EntityComponentSystem";
import {CanvasContextManager} from "../logic/CanvasContextManager";
import {SceneManager} from "../logic/SceneManager";
import config from "../config/config.json";
const App: React.FC = () => {
    // Init all singletons
    
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /* eslint-disable no-unused-vars */
    const ecs = ECS.getInstance();
    const contextManager = CanvasContextManager.getInstance();
    const sceneManager = SceneManager.getInstance();
    
    /* eslint-enable no-unused-vars */
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return (
        <div className="App">
            <InterfaceLayout rightPanelFixedWidth={config.rightPanelFixedWidth}/>
        </div>
    );
};

export default App;