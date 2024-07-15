import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, List, ListItem, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CopyButton from './CopyButton';
import EditDialog from './EditDialog';
import CustomAutocomplete from './MultiAutoComplete';

const CollapseComponent = ({ dataset, onRemove }) => {
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [tags, setTags] = useState(dataset.tags ? [...dataset.tags] : []); // Initialize with dataset tags

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
            .then((data) => {
                onRemove(dataset.db_name); // Call parent's remove function
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
                // Assuming backend returns updated dataset with tags
                setTags(data.tags); // Update tags locally
                handleCloseEditDialog(); // Close edit dialog
            })
            .catch((error) => {
                console.error('Error editing dataset:', error);
            });
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    // Function to render key-value pairs of dataset properties in two columns
    const renderDatasetProperties = () => {
        const properties = Object.keys(dataset).filter(key => key.startsWith('db_') && key !== 'db_name');
        const midPoint = Math.ceil(properties.length / 2);
        const firstColumn = properties.slice(0, midPoint);
        const secondColumn = properties.slice(midPoint);

        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ flex: 1 }}>
                    <List sx={{ bgcolor: 'lightgray', minWidth: 200 }}>
                        {firstColumn.map(key => (
                            <ListItem key={key}>
                                <ListItemText primary={key.substring(3)} secondary={dataset[key]} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <List sx={{ bgcolor: 'lightgray', minWidth: 200 }}>
                        {secondColumn.map(key => (
                            <ListItem key={key}>
                                <ListItemText primary={key.substring(3)} secondary={dataset[key]} />
                            </ListItem>
                        ))}
                        {tags.length > 0 && (
                            <ListItem>
                                <ListItemText primary="Tags" secondary={tags.join(', ')} />
                            </ListItem>
                        )}
                    </List>
                </Box>
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
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
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
                                marginRight: '8px',
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
                                marginRight: '8px',
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
                <AccordionDetails>
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
                    options={[]} // You may need to fetch options dynamically
                    value={tags}
                    onChange={setTags}
                    placeholder="Add Tags"
                />
            </EditDialog>
        </>
    );
};

export default CollapseComponent;
