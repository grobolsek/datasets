import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider} from 'react-router-dom'

import EditPage from "./pages/datasets/AddPage";
import InfoPage from "./pages/datasets/InfoPage";
import NotFoundPage from "./pages/NotFoundPage";


const router = createBrowserRouter([
    {
        path: "/",
        element: <InfoPage />,
        errorElement: <NotFoundPage />,
    },
    {
        path: "/edit",
        element: <EditPage />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)

