import React, { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import CollapseComponent from '../../components/CollapseComponent';

const App = () => {
    const [datasets, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data from the /info endpoint
        fetch('/get/info')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setData(Object.entries(data).map(([key, value]) => ({ ...value, name: key })));
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    const handleRemoveDataset = (datasetName) => {
        setData((prevData) => prevData.filter((dataset) => dataset.name !== datasetName));
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <Container>
            {datasets.map((dataset, index) => (
                <CollapseComponent key={index} dataset={dataset} onRemove={handleRemoveDataset} />
            ))}
        </Container>
    );
};

export default App;
