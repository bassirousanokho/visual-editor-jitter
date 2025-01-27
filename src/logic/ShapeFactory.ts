import {Shape} from "../Geometry/Shape";
import Rectangle from "../Geometry/Rectangle";
import {Position, Rotation, ShapeType, Size, Color} from "../types";

/**
 * A factory class for creating different types of shape objects.
 */
export class ShapeFactory {
    /**
     * Creates and returns a shape object based on the specified type and properties.
     *
     * @param {ShapeType} type - The type of the shape to create (e.g., "Rectangle").
     * @param {Position} position - The position of the shape.
     * @param {Size} size - The dimensions of the shape.
     * @param {Rotation} rotation - The rotation of the shape.
     * @param {Color} color - The color of the shape.
     * @return {Shape} The created shape object.
     * @throws {Error} If an unknown shape type is provided.
     */
    static createShape(
        type: ShapeType,
        position: Position,
        size:Size,
        rotation:Rotation,
        color:Color,
    ): Shape {
        switch (type) {
        case "Rectangle":
            return new Rectangle(position, size, color,rotation);
        default:
            throw new Error(`Unknown shape type: ${type}`);
        }
    }
}