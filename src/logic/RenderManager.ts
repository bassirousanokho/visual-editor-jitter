import {ECS} from "./EntityComponentSystem";
import {Scene} from "./Scene";
import {SceneManager} from "./SceneManager";
import {CanvasContextManager} from "./CanvasContextManager";

/**
 * RenderManager is responsible for managing rendering and animation of scenes,
 * including applying rotation animations to entities and rendering shapes onto a canvas.
 */
export class RenderManager {
    private static _isAnimating: boolean = false;
    private static _timeLeft: number = 0;
    private static _animationTimer: number = 0;
       
    static get isAnimating(): boolean {
        return RenderManager._isAnimating;
    }
    
    static stopAnimation(): void {
        RenderManager._isAnimating = false;
    }
    static get animationTimer(): number {
        return RenderManager._animationTimer;
    }
    
    static get timeLeft(): number {
        return RenderManager._timeLeft;
    }
    /**
     * Updates and processes the rotation system for entities with "RotationControl" components based on elapsed time.
     * @param {number} deltaTime - The time delta since the last frame, used to calculate the progression of the rotation animation.
     */
    private static rotationSystem(deltaTime:number):void
    {
        const ecs = ECS.getInstance();
        const controlEntities :Map<number,any> | undefined = ecs.getComponents("RotationControl");
        
        controlEntities?.forEach((control, entityId) => {
            const rotation = SceneManager.getInstance().getCurrentScene()?.getShape(entityId)?.getAnimationRotation();
            if (!rotation) return;

            // Increment elapsed time
            control.elapsedTime += deltaTime;
            RenderManager._timeLeft = control.elapsedTime / control.duration ;
            // Ensure time doesn't exceed the total duration
            const progress = Math.min(control.elapsedTime / control.duration, 1); // Value between 0 and 1

            // Linearly interpolate the angle
            rotation.angle = control.startAngle + progress * control.targetAngle;

            // Remove the rotation control if the animation is finished
            if (progress >= 1) {
                rotation.angle = control.startAngle;
                RenderManager._timeLeft = 0;
                RenderManager._isAnimating = false;
                ecs.removeComponent(entityId, "RotationControl");
            }
        });
    }
    
    /**
     * Renders the given scene onto a canvas using the provided rendering context.
     *
     * @param {Scene} scene - The scene object containing shapes to be rendered.
     * @param {CanvasRenderingContext2D} ctx - The rendering context of the canvas where the scene will be drawn.
     */
    public static Render(scene:Scene,ctx:CanvasRenderingContext2D): void
    {
        if (!scene || !ctx) return;

        const canvas = ctx.canvas; // Get the canvas element
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Clear the canvas before rendering
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw each shape in the scene based on the updated canvas size
        scene.getShapes().forEach((shape) => {
            shape.draw(ctx, canvasWidth, canvasHeight);
        });
    }

    /**
     * Handles the animation loop, rendering the current scene and managing rotations.
     * Stops rendering if the animation flag is turned off or necessary resources are unavailable.
     * Updates the scene based on the delta time since the last frame.
     *
     * @param {number | null} [lastTime=null] - The timestamp of the previous frame, used to calculate delta time. Pass null for the first frame.
     */
    static animate(lastTime: number | null = null): void {
        const scene = SceneManager.getInstance().getCurrentScene();
        const canvas = CanvasContextManager.getInstance().getCurrentCanvasContext();

        // Early return if animation is stopped or context/scene is not available
        if (!RenderManager._isAnimating) {
            //console.log("Animation stopped.");
            this.resetRotations();
            if (scene && canvas) {
                RenderManager.Render(scene, canvas);
            }
            return;
        }

        if (!scene || !canvas) return;

        const now = performance.now();
        const deltaTime = lastTime === null ? 0 : now - lastTime;

        // Process rotation system and render scene
        RenderManager.rotationSystem(deltaTime);
        RenderManager.Render(scene, canvas);

        // Continue the animation loop
        requestAnimationFrame(() => this.animate(now));
    }

    /**
     * Resets the rotations for all entities that have the "RotationControl" component.
     * The method iterates through entities with the "RotationControl" component and resets
     * their shape rotation in the current scene.
     */
    private static resetRotations(): void {
        ECS.getInstance()
            .getComponents("RotationControl")
            ?.forEach((_, entityId) => {
                SceneManager.getInstance()
                    .getCurrentScene()
                    ?.getShape(entityId)
                    ?.resetRotation();
            });
    }
    /**
     * Restarts the current animation by resetting the rotation of entities with the "RotationControl" component.
     *
     * @param {ECS} ecs - The ECS (Entity Component System) instance, which is used to access and manipulate entities and their components.
     */
    static restartAnimation(ecs:ECS): void {
        const scene = SceneManager.getInstance().getCurrentScene();
        if(!scene) return;
        const canvas = CanvasContextManager.getInstance().getCurrentCanvasContext();
        if(!canvas) return;
        const controlEntities = ecs.getComponents("RotationControl");
        controlEntities?.forEach((_, entityId) => {
            SceneManager.getInstance().getCurrentScene()?.getShape(entityId)?.resetRotation();
        });
        window.addToast?.("Restarting current animation", "info");
    }

    /**
     * Plays an animation on a given scene for the specified duration.
     * Handles restarting the animation if an animation is already in progress.
     * Ensures rotation controls are applied, and renders the scene appropriately.
     *
     * @param {Scene} scene - The scene object on which the animation is applied.
     * @param {number} duration - The duration of the animation in milliseconds.
     */
    static playAnimation(scene: Scene, duration: number): void {
        const ANIMATION_START_MESSAGE = `Starting new animation for ${duration}ms`;

        RenderManager._animationTimer = duration;

        window.addToast?.(ANIMATION_START_MESSAGE, "success");

        const entityComponentSystem = ECS.getInstance();
        if (!entityComponentSystem) return;

        if (RenderManager._isAnimating) {
            // Restart the current animation and update all shapes
            RenderManager.restartAnimation(entityComponentSystem);
            this.applyRotationControl(scene, entityComponentSystem, duration);

            const canvasContext = CanvasContextManager.getInstance().getCurrentCanvasContext();
            if (!canvasContext) {
                return;
            }

            RenderManager.Render(scene, canvasContext);
            return;
        }

        // Apply rotation controls and start the animation loop
        this.applyRotationControl(scene, entityComponentSystem, duration);
        RenderManager._isAnimating = true;
        RenderManager.animate();
    }

    /**
     * Applies rotational control to all shapes in the scene.
     *
     * This method iterates over all shapes in the specified scene, retrieves their
     * current rotation, and assigns a "RotationControl" component to each shape's
     * entity in the ECS. The "RotationControl" component defines the properties
     * needed for the shape to complete a full rotation within a specified duration.
     *
     * @param {Scene} scene - The scene containing the shapes to which the rotation control will be applied.
     * @param {ECS} ecs - The Entity Component System used to manage components of the shapes.
     * @param {number} duration - The duration (in milliseconds) over which the full rotation should be completed.
     */
    private static applyRotationControl(scene: Scene, ecs: ECS, duration: number): void {
        scene.getShapes().forEach((shape) => {
            const rotation = shape.getRotation();
            ecs.addComponent(shape._entityID, "RotationControl", {
                startAngle: rotation.angle,
                targetAngle: Math.PI * 2, // One full rotation
                duration: duration,
                elapsedTime: 0,
            });
        });
    }
}