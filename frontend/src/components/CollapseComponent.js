import React, { useState, useEffect } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography, // Ensure Typography is imported from MUI
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CopyButton from './CopyButton';
import EditDialog from './EditDialog';
import CustomAutocomplete from './MultiAutoComplete';

const CollapseComponent = ({ dataset: initialDataset, onRemove }) => {
    const [dataset, setDataset] = useState(initialDataset);
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        setDataset(initialDataset);
    }, [initialDataset]);

    const handleRemoveClick = (e) => {
        e.stopPropagation();
        setOpenRemoveDialog(true);
    };

    const handleCloseRemoveDialog = () => {
        setOpenRemoveDialog(false);
    };

    const handleConfirmRemove = () => {
        fetch(`/remove/${dataset.db_name}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                onRemove(dataset.db_name);
                handleCloseRemoveDialog();
            })
            .catch((error) => {
                console.error('Error removing dataset:', error);
            });
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        setOpenEditDialog(true);
    };

    const handleEditSave = (updatedDataset) => {
        fetch(`/edit/${dataset.db_name}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedDataset),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setDataset(data);
                handleCloseEditDialog();
            })
            .catch((error) => {
                console.error('Error editing dataset:', error);
            });
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const renderDatasetProperties = () => {
        const properties = Object.keys(dataset).filter(key => key.startsWith('db_') && key !== 'db_name');
        return (
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                maxHeight: '500px',
                overflowY: 'auto',
                padding: '8px'
            }}>
                {properties.map((key) => (
                    <Box key={key} sx={{
                        flex: '1 1 calc(50% - 8px)',
                        marginBottom: '16px',
                        boxSizing: 'border-box',
                        padding: '8px',
                        borderBottom: '1px solid #ddd'
                    }}>
                        <Typography variant='h6'>{key.substring(3)}</Typography>
                        <Typography>{key === 'db_tags'
                            ? dataset[key].join(', ')
                            : dataset[key]}
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <>
            <Accordion
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel-content"
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>{dataset.db_name}</Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            opacity: hovered ? 1 : 0,
                            transition: 'opacity 0.4s ease',
                            mx: 2
                        }}
                    >
                        <Button
                            sx={{
                                bgcolor: '#ff9100',
                                ':hover': {
                                    bgcolor: '#b26500',
                                },
                                marginRight: 1,
                            }}
                            variant="contained"
                            onClick={handleEditClick}
                        >
                            EDIT
                        </Button>
                        <Button
                            sx={{
                                bgcolor: '#d50000',
                                ':hover': {
                                    bgcolor: '#950000',
                                },
                                marginRight: 1,
                            }}
                            variant="contained"
                            onClick={handleRemoveClick}
                        >
                            REMOVE
                        </Button>
                        <CopyButton
                            textToCopy={JSON.stringify(dataset, null, 2)}
                            onClick={(e) => { e.stopPropagation(); }}
                        />
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3, backgroundColor: '#e0e0e0', borderRadius: '16px 16px 0 0' }}>
                    {renderDatasetProperties()}
                </AccordionDetails>
            </Accordion>

            <Dialog open={openRemoveDialog} onClose={handleCloseRemoveDialog}>
                <DialogTitle>Confirm Remove</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove the dataset "{dataset.db_name}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRemoveDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmRemove} color="secondary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <EditDialog
                open={openEditDialog}
                onClose={handleCloseEditDialog}
                dataset={dataset}
                onSave={handleEditSave}
            >
                <CustomAutocomplete
                    options={[]}
                    value={dataset.tags}
                    placeholder="Add Tags"
                />
            </EditDialog>
        </>
    );
};

export default CollapseComponent;
