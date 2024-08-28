import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App"; // Adjust the path as necessary to where your App component is defined

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

// If you're using strict mode, wrap App in <React.StrictMode>
// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
