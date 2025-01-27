import React from "react";
import { ToastProvider } from "./utils/ToastProvider.tsx";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";

const rootElement = document.getElementById("root") as HTMLElement;


const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <ToastProvider>
            <App />
        </ToastProvider>
    </React.StrictMode>
);

