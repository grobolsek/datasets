import React from 'react';
import ReactDOM from 'react-dom/client';

import {debouncedHandleResize} from "./utils";
import InfoPage from "./pages/InfoPage";


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <InfoPage />
    </React.StrictMode>
)

// Setting up ResizeObserver with the debounced handler
const resizeObserver = new ResizeObserver(debouncedHandleResize);
resizeObserver.observe(document.body); // Observe the body or any other element