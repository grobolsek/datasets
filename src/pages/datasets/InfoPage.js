import React, { useEffect, useState } from 'react';
import {Box, Button, Container, Typography} from '@mui/material';
import CollapseComponent from '../../components/CollapseComponent';
import { useNavigate   } from "react-router-dom";

const InfoPage = () => {
    const [datasets, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation= useNavigate();

    useEffect(() => {
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
                console.log(data)
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

    const redirectToAddPage = () => {
        let path = '/edit';
        navigation(path)
    };

    return (
        <Container>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component="h1" variant="h4">
                    Dataset info
                </Typography>
                <Button
                    sx={{
                        bgcolor: '#00e676',
                        ':hover': {
                            bgcolor: '#00a152'
                        }
                    }}
                    variant="contained"
                    onClick={redirectToAddPage}>ADD
                </Button>
            </Box>
            {datasets.map((dataset, index) => (
                <CollapseComponent key={index} dataset={dataset} onRemove={handleRemoveDataset} />
            ))}
        </Container>
    );
};

export default InfoPage;
