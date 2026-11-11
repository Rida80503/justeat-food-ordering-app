/**
 * Entry point of the React application.
 *
 * Responsibilities:
 * - Creates the React root.
 * - Configures Redux.
 * - Enables React Router.
 * - Registers global notifications.
 * - Renders the main App component.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import "./styles.css";

import store from "./store";

/**
 * Initializes and renders the
 * React application.
 */
ReactDOM.createRoot(document.getElementById("root")).render(

  // Enable additional development checks
  <React.StrictMode>

    {/* Provide Redux store to the application */}
    <Provider store={store}>

      {/* Enable client-side routing */}
      <BrowserRouter>

        {/* Root application component */}
        <App />

        {/* Global notification container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

      </BrowserRouter>

    </Provider>

  </React.StrictMode>
);