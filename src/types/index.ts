import React from "react";


// BASIC MATH TYPES
export type vec2 = {x: number,y: number};
export type Position = { x: number; y: number };
export type Size = { width: number; height: number };
export type Color = { value: string };
export type Rotation = { angle: number};

//SHAPE TYPES
export type ShapeType = "Rectangle";// to add more | "Circle" | "Line";

// ESC - ANIMATION TYPES
export type RotationControl = {
    startAngle: number; // Starting angle of the rectangle in radians
    targetAngle: number; // Target angle, e.g., pi * 2 for a full rotation
    duration: number; // Animation duration in ms
    elapsedTime: number; // Time passed since the animation started
    deltaAngle : number; // Angle change per frame
    currentAngle:number;
};
export type DepthControl = {
    z_index: {value: number};
}
export type entityPropertiesMap = Map<number, any>;
export type entityComponentsMap = Map<string,entityPropertiesMap>;

// I/O TYPES

export type FileTypes = "application/json" | "text/plain";

// INTERFACE TYPES
export interface InterfaceLayoutProps {
    rightPanelFixedWidth: number; // Fixed width for the right panel in percentage (e.g., 20%)
}

export interface ControlManagerState {
    duration: number;
    isInputValid: boolean;
}

export interface CanvasPanelProps {
    BgColor: string; // Dynamic background color for the canvas
    id:number;
    canvasRef: React.RefObject<HTMLCanvasElement | null> ; // Optional React ref for the canvas element
}

// TOASTER TYPES 

export type ToastState = "success" | "error" | "warning" | "info";

export interface ToastProps {
    toast: {
        id: string;
        message: string;
        color: string;
    };
}
export interface ToastDetails {
    id: string;
    message: string;
    state: ToastState;
    color: string;
}


export interface ToastContextType {
    addToast: (message: string, state: ToastState) => void;
}
