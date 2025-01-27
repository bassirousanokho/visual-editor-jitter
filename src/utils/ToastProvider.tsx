import React from "react";
import {ToastContextType, ToastDetails, ToastState} from "../types";
import Toast from "./Toast";


const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

/**
 * A provider component to manage and display toast notifications in a React application.
 * This component maintains the state of active toasts and provides a method to add new toast messages.
 * It also exposes a context for child components to trigger toast notifications.
 * source: stackoverflow.
 */
export class ToastProvider extends React.Component<{ children: React.ReactNode }, { toasts: ToastDetails[] }> {
    constructor(props: any) {
        super(props);
        this.state = {
            toasts: [],
        };

        // Attach `addToast` globally to the `window` object
        (window as any).addToast = this.addToast;
    }

    /**
     * Adds a new toast message to the list of toasts to be displayed.
     * The toast will be automatically removed after a specified duration.
     *
     * @param {string} message - The message to be displayed in the toast.
     * @param {ToastState} state - The state of the toast, which determines its styling.
     *                             The state is used to categorize the toast (e.g., success, error, info).
     */
    addToast = (message: string, state: ToastState): void => {
        const id = Math.random().toString(36).substr(2, 9);
        const color = this.getColorByState(state);

        this.setState(
            (prevState) => ({
                toasts: [...prevState.toasts, { id, message, state, color }],
            }),
            () => {
                // Automatically remove the toast after 5 seconds
                setTimeout(() => this.removeToast(id), 2000);
            }
        );
    };

    /**
     * Removes a toast notification from the list of active toasts based on its unique identifier.
     *
     * @param {string} id - The unique identifier of the toast to be removed.
     */
    removeToast = (id: string): void => {
        this.setState((prevState) => ({
            toasts: prevState.toasts.filter((toast) => toast.id !== id),
        }));
    };

    
    /**
     * Determines the appropriate color based on the given toast state.
     *
     * @param {ToastState} state - The state of the toast for which the color is required.
     * @returns {string} The color corresponding to the specified toast state.
     */
    getColorByState = (state: ToastState): string => {
        switch (state) {
        case "success":
            return "green";
        case "error":
            return "red";
        case "warning":
            return "orange";
        case "info":
            return "blue";
        default:
            return "gray";
        }
    };

    render() {
        return (
            <ToastContext.Provider value={{ addToast: this.addToast }}>
                {this.props.children}
                <div style={{ position: "fixed", bottom: 20, right: 20 }}>
                    {this.state.toasts.map((toast) => (
                        <Toast key={toast.id} toast={toast} />
                    ))}
                </div>
            </ToastContext.Provider>
        );
    }
}
