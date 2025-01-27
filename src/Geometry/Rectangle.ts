import {Shape} from "./Shape";
import {Color, Position, Rotation, ShapeType, Size} from "../types";

/**
 * Represents a rectangle shape, extending the base class `Shape`.
 */
export default class Rectangle extends Shape {
    
    _type: ShapeType = "Rectangle";
    constructor(position:Position, size:Size, color:Color, rotation:Rotation) {
        super(position, size, color, rotation);
    }
    
    /**
     * Serializes the shape.
     */
    serialize(): object {
        return {
            type: this._type.toString(),
            position: this.getPosition(),
            size: this.getSize(),
            color: this.getColor(),
            orientation: this.getRotation(),
            zindex: this.getZIndex()
        };
    }
}