import React, { useEffect, useState } from 'react';
import { Container } from "@mui/material";
import CollapseComponent from "../../components/CollapseComponent";

const App = () => {
    const [datasets, setDatasets] = useState([]); // Initialize as an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data from the /info endpoint
        fetch('/info')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((datasets) => {
                setDatasets(Object.values(datasets)); // Convert object to array
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <Container>
            {datasets.map((dataset, index) => (
                <CollapseComponent key={index} dataset={dataset} />
            ))}
        </Container>
    );
};

export default App;
