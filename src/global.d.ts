export {};

declare global {
    /**
     * Represents the browser's global window object with an optional method for displaying toast notifications.
     *
     * Properties:
     * - addToast: An optional method for triggering toast messages. It takes two parameters:
     *    - message: A string representing the message to display.
     *    - state: A string value that denotes the type of notification. Acceptable values include "success", "error", "warning", and "info".
     */
    interface Window {
        addToast?: (message: string, state: "success" | "error" | "warning" | "info") => void;
    }
}