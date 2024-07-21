import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import CollapseComponent from '../components/CollapseComponent';
import EditDialog from '../components/EditDialog'; // Import EditDialog component
import CustomAutocomplete from "../components/MultiAutoComplete";

const InfoPage = () => {
    const [datasets, setDatasets] = useState(null);
    const [error, setError] = useState(null);
    const [edited, setEdited] = useState(null); // State to hold dataset being edited
    const [expanded, setExpanded] = useState(false); // State to hold expanded dataset

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
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error);
            });
    }, []);

    const handleCloseEditDialog = useCallback((newData, reason) => {
        if (reason === "backdropClick") {
            return;
        }
        if (newData) {
            setDatasets((prevDatasets) => ({
                ...prevDatasets,
                [edited]: newData
            }));
        }
        setEdited(null);
    }, [edited]);

    const handleRemoveDataset = useCallback((dataset_id) => {
        // ask for confirmation before removing
        if (!window.confirm(
            `Are you sure you want to remove dataset ${datasets[dataset_id].name}?`)
        ) {
            return;
        }
        fetch(`/remove/${dataset_id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                setDatasets((prevDatasets) =>
                    Object.fromEntries(
                        Object.entries(prevDatasets)
                            .filter(([location]) => location !== dataset_id)
                    )
                );
            })
    }, [datasets]);

    const handleExpansion = (dataset_id, expanded) => {
        setExpanded(expanded && dataset_id);
    }

    return (
        error ? <p>Error: {error.message}</p> :
            datasets === null ? <p>Loading...</p> :
        <Container>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component="h1" variant="h4" sx={{margin: "24px 0"}}>
                    Repository of Orange Data Sets
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => setEdited(-1)}
                >
                    New Data Set
                </Button>
            </Box>
            {Object.entries(datasets)
                .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                .map(([dataset_id, dataset]) => (
                <CollapseComponent
                    key={`${dataset_id}-${dataset.version}`}
                    expanded={expanded === dataset_id}
                    dataset={dataset}
                    onChange={(e, expanded) => handleExpansion(dataset_id, expanded) }
                    onRemove={() => { handleRemoveDataset(dataset_id) }}
                    startEdit={() => { setEdited(dataset_id)}}
                />
            ))}
            {edited &&
                <EditDialog
                    location={edited}
                    initialData={datasets[edited]}
                    onClose={handleCloseEditDialog}
                >
                    <CustomAutocomplete
                        options={[]}
                        value={datasets[edited]?.tags || []}
                        placeholder="Add Tags"
                    />
                </EditDialog>
            }
        </Container>
    );
};

export default InfoPage;
