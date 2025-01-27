import {Color, Position, Rotation, ShapeType, Size} from "../types";
import {ECS} from "../logic/EntityComponentSystem";
import {RenderManager} from "../logic/RenderManager";
import config from "../config/config.json";

/**
 * Represents an abstract base class for a shape 
 * Properties are position, size, color, and rotation
 * This is an entity the ECS keeps track of it's id
 */
export abstract class Shape 
{
    // Mandatory implementation of type
    // must be the name of the class
    // used to serialize the object
    abstract _type: ShapeType;
    private static readonly _maxSize : number = config.MAX_SIZE_SHAPE;
    _position:Position;
    _size:Size;
    _color:Color;
    _rotation:Rotation;
    _animationRotation:Rotation; // this is only used for rotation animation
    _entityID:number;
    _zindex:number = 0;
    
    constructor(position:Position, size:Size, color:Color, rotation:Rotation)
    {
        this._position = position;
        this._size = size;
        this._color = color;
        this._rotation = rotation;
        this._animationRotation = {angle: rotation.angle};
        this._entityID = ECS.getInstance().createEntity();
        //check if we should animate right away
        this.checkSceneIsAnimating();
        this._zindex = 0;
    }


    /**
     * Checks if the scene containing this shape is currently animating. 
     * Adds a rotation control component and animates for a fraction of the target angle
     * The target angle is recalculated according to the ratio elapsed time / animation time
     */
    checkSceneIsAnimating(): void {
        if(!RenderManager.isAnimating) return;
        const ecs = ECS.getInstance(); // Retrieve the ECS singleton instance
        if (!ecs) return;
        ecs.addComponent(this._entityID, "RotationControl", {
            startAngle: this.getRotation().angle,
            targetAngle: Math.PI * 2 * (1.0-RenderManager.timeLeft), // Full rotation
            duration: RenderManager.animationTimer,
            elapsedTime: 0,
            currentAngle: this.getRotation().angle
        });
    }
    static get maxSize():number
    {
        return Shape._maxSize;
    }
    
    get entityID():number
    {
        return this._entityID;
    }
    

    /**
     * Check if the shape was clicked.
     *
     * @param {number} mouseX - The X-coordinate of the mouse position, relative to the viewport.
     * @param {number} mouseY - The Y-coordinate of the mouse position, relative to the viewport.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas where the object is drawn.
     * @return {boolean} True if the mouse click falls within the object's boundaries, otherwise false.
     */
    isClicked(mouseX: number, mouseY: number,ctx: CanvasRenderingContext2D): boolean
    {
        const x = this._position.x * ctx.canvas.width;
        const y = this._position.y * ctx.canvas.height;
        const width = this._size.width * ctx.canvas.width;
        const height = this._size.height * ctx.canvas.height;
        
        // Push matrix
        ctx.save();
        //set the context to the rectangle's position and rotation
        // Translate to the rectangle's center
        const centerX = x + width / 2.0;
        const centerY = y + height / 2.0;
        ctx.translate(centerX, centerY);

        // Rotate the canvas to align with the rectangle's current rotation
        ctx.rotate(this._animationRotation.angle);

        // Define the rectangle path (relative to its center after translation)
        ctx.beginPath();
        ctx.rect(
            -width / 2, // X coordinate relative to center
            -height / 2, // Y coordinate relative to center
            width,
            height
        );
        const clicked = ctx.isPointInPath(mouseX, mouseY);
        // Pop matrix
        ctx.restore();
        return clicked;
    }
    /**
     * Resets the current rotation of the object by aligning
     * the animation's rotation angle with the object's rotation angle.
     */
    resetRotation():void
    {
        this._animationRotation.angle = this._rotation.angle;
    }
    /**
     * Retrieves the size of the object.
     *
     * @return {Size} The current size of the object.
     */
    getSize():Size {
        return this._size;
    }

    /**
     * Retrieves the current color value.
     *
     * @return {Color} The current color value.
     */
    getColor():Color {
        return this._color;
    }

    /**
     * Retrieves the current rotation value.
     *
     * @return {Rotation} The current rotation object.
     */
    getRotation():Rotation {
        return this._rotation;
    }
    /**
     * Retrieves the current animation rotation.
     *
     * @return {Rotation} The current rotation value of the animation.
     */
    getAnimationRotation():Rotation {
        return this._animationRotation;
    }
    /**
     * Retrieves the current position.
     *
     * @return {Position} The current position.
     */
    getPosition():Position {
        return this._position;
    }

    /**
     * Draws the object on the given canvas context with specified transformations and properties.
     *
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for the drawing surface of the canvas.
     * @param {number} canvasWidth - The width of the canvas used to calculate the object's position and size.
     * @param {number} canvasHeight - The height of the canvas used to calculate the object's position and size.
     */
    public draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void 
    {
        const ecs = ECS.getInstance();
        if(!ecs) return;
        
        const x = this._position.x * canvasWidth;
        const y = this._position.y * canvasHeight;
        const width = this._size.width * canvasWidth;
        const height = this._size.height * canvasHeight;

        const centerX = x + width / 2;
        const centerY = y + height / 2;
        // Translate to the rectangle's center for rotation
        ctx.save(); // Save the canvas state
        ctx.translate(centerX, centerY);
        // Rotate around the center (x, y)
        
        ctx.rotate(this._animationRotation.angle);

        ctx.translate(-centerX, -centerY);
        ctx.fillStyle = this._color.value;
        // Use calculated dimensions to draw a rectangle
        ctx.fillRect(x, y, width, height);

        ctx.restore(); // Restore the canvas state
    }

    /**
     * Sets the color of the object.
     *
     * @param {Color} color - The color to be set.
     */
    setColor(color: Color):void {
        this._color = color;
    }

    /**
     * Sets the z-index value for the element.
     *
     * @param {number} index - The z-index value to be set.
     */
    setZIndex(index: number):void {
        this._zindex = index;
    }

    /**
     * Retrieves the z-index value of the current instance.
     *
     * @return {number} The z-index value.
     */
    getZIndex():number {
        return this._zindex;
    }
    
    abstract serialize(): any ;

    /**
     * Removes the entity associated with the current object from the ECS .
     */
    remove():void {
        ECS.getInstance().deleteEntity(this._entityID);
    }
}