import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider} from 'react-router-dom'

import DataPage from "./pages/datasets/DataPage";
import EditPage from "./pages/datasets/EditPage";
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
    {
        path: "/data",
        element: <DataPage />,
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)

