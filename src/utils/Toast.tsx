import React, {JSX} from "react";
import {ToastProps} from "../types";



/**
 * A React component that renders a dismissible toast notification.
 *
 * Props:
 * - `toast`: An object containing properties `color` and `message`.
 *    - `color`: A string representing the background color of the toast.
 *    - `message`: A string to display as the message content of the toast.
 */
export class Toast extends React.Component<ToastProps> {
    render(): JSX.Element {
        const { toast } = this.props;

        return (
            <div
                style={{
                    backgroundColor: toast.color,
                    color: "white",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    marginBottom: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
            >
                {toast.message}
            </div>
        );
    }
}

export default Toast;