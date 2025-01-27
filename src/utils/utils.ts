import {Color, FileTypes, Position, Rotation, Size, vec2} from "../types";
import {Shape} from "../Geometry/Shape";


/**
 * Utility class containing various helper methods for common operations.
 */
export default class Utils {
    /**
     * Generates a random hexadecimal color code.
     *
     * @return {Color} "#RRGGBB".
     */
    public static randomColor(): Color {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return {value:color};
    }

    /**
     * Generates a random rotation.
     *
     * @return {Rotation} an angle in radians 
     */
    public static randomOrientation():Rotation  {
        return {angle:Math.random() * Math.PI *2.0};
    }

    /**
     *  Generate a random vector 2 with 2 components x y 
     *  @return vec2
     */
    public static randomVec2Percent(): vec2
    {
        return {
            x: Math.random(),
            y: Math.random()
        }
    }

    /**
     * @param file the file to be read
     * @return a promise containg the content (string) of the file
     */
    public static readFile(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e):void => {
                if (e.target?.result) {
                    resolve(e.target.result as string);
                }
            };
            reader.readAsText(file);
        });
    }
    /**
     * Initiates the download of a file with the specified data, filename, and file type.
     *
     * @param {string} data - The content of the file to be downloaded.
     * @param {string} filename - The name with which the file will be saved.
     * @param {FileTypes} fileType - The MIME type of the file being downloaded.
     * @return {void} This method does not return a value.
     */
    public static downloadFile(data: string, filename: string,fileType:FileTypes):void{
        const blob = new Blob([data], { type: fileType });
        if (blob.size === 0) {
            window.addToast?.("Scene may be empty or corrupted", "error");
            return;
        }

        const href = URL.createObjectURL(blob);

        if (!href) {
            window.addToast?.("Failed to create a file to write.", "error");
            return;
        }

        const link = document.createElement("a");
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.addToast?.("Project downloaded successfully!", "success");
    }

    /**
     * Calculates a random position and size for a rectangle within the bounds of a given canvas.
     * The position and size are normalized to percentages of the canvas dimensions.
     *
     * @param canvas The HTML canvas element used to determine the bounding area for the rectangle.
     * @return An object containing `pos`, a 2D vector representing the normalized position (as percentages),
     *         and `rectSize`, representing the normalized width and height (as percentages) of the rectangle.
     */
    public static GetPositionAndSizeWithinBounds(canvas: HTMLCanvasElement):{pos:Position, rectSize:Size} {
        // Get canvas dimensions
        const boundingRect = canvas.getBoundingClientRect();
        const canvasSize: vec2 = {
            x: boundingRect.width, // Use actual visible size for accurate scaling
            y: boundingRect.height
        };

        // Generate random position and size as percentages
        const pos = Utils.randomVec2Percent(); // Random position in percentage (0 to 1)
        const size = Utils.randomVec2Percent(); // Random size in percentage (0 to 1)

        const maxSize = Shape.maxSize;
        // Calculate rectangle size, factoring max size
        const rectSize: Size = {
            width: size.x * canvasSize.x * maxSize,
            height: size.y * canvasSize.y * maxSize
        };

        // calculate the diagonal of the rectangle
        const diagonal = Math.sqrt(Math.pow(rectSize.width, 2) + Math.pow(rectSize.height, 2));


        // Constrain position to ensure the entire rectangle stays within canvas bounds
        const centerX = pos.x * canvasSize.x; // Convert position to absolute coordinates
        const centerY = pos.y * canvasSize.y;

        const constrainedX = Math.max(diagonal, Math.min(canvasSize.x - diagonal, centerX)); // Constrain X position
        const constrainedY = Math.max(diagonal, Math.min(canvasSize.y - diagonal, centerY)); // Constrain Y position

        // Normalize position back to percentages (0 to 1)
        pos.x = constrainedX / canvasSize.x;
        pos.y = constrainedY / canvasSize.y;

        // Normalize rectSize to percentages
        rectSize.width = rectSize.width / canvasSize.x;
        rectSize.height = rectSize.height / canvasSize.y;

        return { pos, rectSize };
    }
    
}