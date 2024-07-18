import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import CollapseComponent from '../components/CollapseComponent';
import EditDialog from '../components/EditDialog'; // Import EditDialog component
import { useNavigate } from "react-router-dom";

const InfoPage = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false); // State for EditDialog
    const [selectedDataset, setSelectedDataset] = useState(null); // State to hold dataset being edited
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/get')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setDatasets(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    const handleRemoveDataset = (datasetName) => {
        setDatasets((prevDatasets) => prevDatasets.filter((dataset) => dataset.db_name !== datasetName));
    };

    const handleEditDataset = (dataset) => {
        setSelectedDataset(dataset);
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setSelectedDataset(null);
        setEditDialogOpen(false);
    };

    const handleSaveDataset = (changedFields) => {
        // Prepare data to send to backend
        const { db_name, ...updates } = changedFields;
        fetch(`/edit/${db_name}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((updatedDataset) => {
                // Update dataset in local state with changes from backend if necessary
                const updatedDatasets = datasets.map((dataset) =>
                    dataset.db_name === updatedDataset.db_name ? updatedDataset : dataset
                );
                setDatasets(updatedDatasets);
                handleCloseEditDialog(); // Close the edit dialog
            })
            .catch((error) => {
                console.error('Error updating dataset:', error);
            });
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    const redirectToAddPage = () => {
        let path = '/add';
        navigate(path);
    };

    return (
        <Container>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component="h1" variant="h4">
                    Dataset Info
                </Typography>
                <Button
                    sx={{
                        bgcolor: '#00e676',
                        ':hover': {
                            bgcolor: '#00a152',
                        },
                    }}
                    variant="contained"
                    onClick={redirectToAddPage}
                >
                    ADD
                </Button>
            </Box>
            {datasets.map((dataset, index) => (
                <CollapseComponent
                    key={index}
                    dataset={dataset}
                    onRemove={handleRemoveDataset}
                    onEdit={() => handleEditDataset(dataset)} // Pass function to handle edit
                />
            ))}
            {/* EditDialog component */}
            {selectedDataset && (
                <EditDialog
                    open={editDialogOpen}
                    onClose={handleCloseEditDialog}
                    dataset={selectedDataset}
                    onSave={handleSaveDataset}
                />
            )}
        </Container>
    );
};

export default InfoPage;
