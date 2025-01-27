import {entityComponentsMap, entityPropertiesMap} from "../types";

/**
 * The ECS class represents an Entity-Component-System framework. 
 * It manageq entities and their associated components like rotations for example. 
 * This is a singleton to ensure only one instance of the ECS class
 * exists throughout the application.
 */
export class ECS {
    private static _instance: ECS | null = null; // Static instance reference
    private _nextEntityId: number; // Keeps track of entity IDs
    private _components: entityComponentsMap; // Stores components
    
    
    public set nextEntityId(value: number) {
        this._nextEntityId = value;
    }
    public get nextEntityId(): number {
        return this._nextEntityId;
    }
    // Private constructor to prevent direct instantiation
    private constructor() {
        this._nextEntityId = 0;
        this._components = new Map();
    }

    // Static method to get the singleton instance of ECS
    public static getInstance(): ECS {
        if (this._instance === null) {
            this._instance = new ECS();
        }
        return this._instance;
    }

    /**
     * Creates a new entity and assigns it a unique ID.
     *
     * @return {number} The unique ID of the newly created entity.
     */
    createEntity(): number {
        return this._nextEntityId++;
    }

    addComponent(entityId: number, componentType: string, data: any):void {
        if (!this._components.has(componentType)) {
            this._components.set(componentType, new Map());
        }
        this._components.get(componentType)!.set(entityId, data);
    }

    getComponents(componentType: string): entityPropertiesMap | undefined {
        return this._components.get(componentType);
    }

    removeComponent(entityId: number, componentType: string):void {
        this._components.get(componentType)?.delete(entityId);
    }
    deleteEntity(_entityID: number):void {
        this._components.forEach((component, componentType) => {
            component.delete(_entityID);
            if (component.size === 0) {
                this._components.delete(componentType);
            }
        })
    }

    clear():void {
        this._components.clear();
        this._nextEntityId = 0;
    }

    serialize() :Object {
        return {
            maxEntityId: this._nextEntityId
        }
    }
}