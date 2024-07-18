import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider} from 'react-router-dom'

import InfoPage from "./pages/InfoPage";
import NotFoundPage from "./pages/NotFoundPage";
import AddPage from "./pages/AddPage";


const router = createBrowserRouter([
    {
        path: "/",
        element: <InfoPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/add",
        element: <AddPage />,
        errorElement: <NotFoundPage />,
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)

