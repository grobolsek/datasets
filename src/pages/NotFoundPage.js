import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return <div>
        <p> 404 Not Found </p>
        <Link to="/">Home</Link>
    </div>
}