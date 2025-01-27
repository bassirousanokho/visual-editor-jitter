# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## TYPESCRIPT WARNING : USE v4.9.5
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them. All the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However, we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# Visual Editor: Canvas and Control Panel

This project implements an interactive **Canvas Visual Editor** that lets users create, manipulate, and interact with shape-based graphics using a two-panel layout: a **Canvas Panel** for shape rendering and interaction, and a **Control Panel** for user actions.

---

## Layout Overview

The project consists of the following key components:

1. **Canvas Panel**:
    - The left side of the interface.
    - Manages multiple canvases where users can render shapes and interact with them.

2. **Control Panel**:
    - The right side of the interface.
    - Provides buttons for various actions, such as adding shapes to the canvases, clearing canvases, and exporting/importing scenes.
    - An improvement would be to add a button to create new scene and consequently new canvases.
---

## Features

### **1. Render Shapes Onto Canvases**
- Shapes such as rectangles are generated dynamically using random properties (size, position, color, rotation) and rendered onto the active canvas.
- Canvases can manage multiple scenes, each containing unique sets of shapes.

### **2. Dynamic Resizing**
- The canvas resizes automatically to adjust to the user's screen or parent container size.

### **3. User Interaction and Scene Management**
- Scene files can be exported and imported to recreate or share designs.
- Users can Animate the shapes. For the moment only a 360° rotation is allowed.
- When a new shape is added to the canvas it rotates to the ratio of the remaining time et goes back into position after the end of the animation.

### **4. Entity Component System (ECS) Integration**
- The project employs an **Entity Component System (ECS)** framework for managing the state and logic of interactive components in a modular way.
- The **ECS** separates data (components) from behavior (systems), ensuring that the application logic is clean, flexible, and easy to scale.
---

## How the Code Works

### **Main Components**

#### 1. `InterfaceLayout.tsx`
- This is the root component for the two-panel interface.
- It manages layout, canvas resizing, and connections between the `CanvasPanel` and `ControlPanel`.

#### 2. Canvas Management (`CanvasPanel.tsx`)
- Responsible for rendering shapes and managing user interactions.
- Uses the `CanvasManager` and `CanvasContextManager` logic for multi-canvas support and managing the active canvas.

#### 3. Shape Management (`Shape.tsx`, `Rectangle.ts`, and `ShapeFactory.tsx`)
- Defines the shape types, properties, and behaviors.
- The `ShapeFactory` creates new shapes with randomized properties (position, size, color).
- **Important!** A shape has a `type :string` which should always match the subclass name.
#### 4. Render Logic (`RenderManager.tsx`)
- Handles rendering of shapes and scenes onto the canvas.
- Integrates with the **ECS** to fetch shape data, such as position, size, and rotation.
- Adjusts for screen scaling using **device pixel ratio (DPR)**.

#### 5. Scene Management (`SceneManager.ts`)
- Stores and organizes shapes for each canvas and handles export/import functionality.
- The `Scene` combines ECS entities and their components, allowing for efficient state updates and re-rendering.

#### 6. User Interaction (`ControlPanel.tsx` , `CanvasManager.ts` and `ControlManager.ts`)
- Processes user actions from the Control Panel and updates the canvas, such as adding new shapes or clearing existing ones.
- Also processes user interaction with the canvas.

#### 7. Utility Methods (`utils.ts`)
- Includes helper functions for randomizing properties, handling DPI-aware resizing, and file operations for exporting and importing scenes.

#### 8. Entity Component System (ECS)
- The **ECS** architecture is implemented in `EntityComponentSystem.ts`.
- It defines three core concepts:
    - **Entities**: Unique IDs representing individual objects or items.
    - **Components**: Data containers that encapsulate specific properties of an entity (e.g., position, size, color).
    - **Systems**: Functions that operate on entities with certain components (e.g., rendering systems, animation systems).

- Example Usage:
    - A `Rectangle` entity might have `RotationControl` component.
    - The `RenderSystem`, which retrieves entities with `RotationControl` components, draws the rectangle on the canvas by reading its `RotationControl` (angle, target, animation time ...) data.
---

## Control Panel Buttons and Their Actions

### **1. Add Rectangle**
- **What It Does**: Adds a rectangle to the currently active canvas. The rectangle's position, size, color, and rotation are randomized.
- **Code Reference**:
    - `ShapeFactory.createRectangle()` generates a new rectangle.
    - The rectangle is added to the active canvas's scene, and `RenderManager` renders it.

### **2. Download Scene**
- **What It Does**: Exports the currently active canvas's scene as a `.json` file, which can later be re-imported to reload the design.
- **Code Reference**:
    - The scene is serialized using `SceneManager.getSceneForCanvas(activeCanvasId).serialize()`.
    - The file download is initiated using a utility function in `utils.ts`.

### **3. Upload Scene**
- **What It Does**: Allows users to import a previously exported `.json` scene file and render it on the active canvas.
- **Code Reference**
  -  The `sceneManager` is responsible for saving and reloading the scenes, the ECS anf the canvas.
  - The uploaded file is parsed, and shapes are added back to the active scene via `Scene.deserialize()`.
  - The `RenderManager` re-renders the scene on the canvas with the restored shapes.
### **4. Set Animation Duration**
- **What It Does**: Allows the user to enter an animation time. If the user enters 0 then a message is displayed asking him to set a valid time.
- **Code Reference**:
    - The duration is set in the `canvasPanel.tsx` and synced to `canvasManager.tsx` an event is created so that this value can be read from the json file.
---

## Example Workflow

1. **Add Shapes**:
    - Click the "Add Rectangle" button multiple times to generate multiple rectangles on the active canvas.
2. **Animate Shapes**:
   - Click on the play animation button to render the animation. 
   - you can add a shape during the animation.
   - you can click on a shape during the animation to change it's color.
3. **Resize the Canvas**:
    - Adjust the browser window size, and notice how the canvas scales automatically to maintain proper rendering using device pixel ratio (DPR).
4. **Export a Scene**:
    - Click the "Download Scene" button to save the current shapes and their properties as a `.json` file.
5. **Import a Scene**:
    - Upload a previously saved `.json` file using the "Upload Scene" button to recreate the design.
---

## Technologies Used

- **React**: For building the user interface.
- **TypeScript**: For type-safe development.
- **Entity Component System (ECS)**: For modular and efficient management of entities, components, and systems.
- **HTML5 Canvas**: For rendering 2D graphics.
- **CSS**: For interface styling and layout.


## Directory Structure

Below is the key structure of the project's directories:

src/ <br>
├── components/<br>
│ ├── interface/ <br>
│ │ ├── CanvasPanel.tsx // Renders shapes on a canvas <br>
│ │ ├── ControlPanel.tsx // Renders control panel buttons <br>
│ │ ├── InterfaceLayout.tsx // Root component for canvas and controls <br>
├── logic/ <br>
│ ├── CanvasManager.ts // Manages all canvas related events <br>
│ ├── CanvasContextManager.ts // Manages all canvases <br>
│ ├── ControlManager.ts // Handles control panel logic <br>
│ ├── RenderManager.ts // Manages rendering shapes <br>
│ ├── EntityComponentSystem.ts // manages entity animations
│ ├── ShapeFactory.ts // Generates shapes dynamically <br>
│ ├── SceneManager.ts // Manages scenes and shape lists <br>
├── Geometry/ <br>
│ ├── Shape.ts // Base shape class <br>
│ ├── Rectangle.ts // Rectangle shape implementation<br> 
├── utils/ <br>
│ ├── utils.ts // Helper functions <br>
│ ├── Toast.tsx // Notification system (e.g., error messages) <br>
│ ├── ToastProvider.tsx // handler for the notif system<br>
├── types/ 
│ ├── index.ts // Shared TypeScript types <br>
└── App.tsx // Main application entry point <br>
├── config/<br>
│ ├── config.json // holds some constants to initialize the scenes <br>