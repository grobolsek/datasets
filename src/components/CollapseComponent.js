import React, { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CopyButton from "./CopyButton";
import {useNavigate} from "react-router-dom";

const CollapseComponent = ({ dataset, onRemove }) => {
    const [expanded, setExpanded] = useState(false);
    const [open, setOpen] = useState(false);
    const navigation= useNavigate();


    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const handleRemoveClick = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirmRemove = () => {
        fetch(`/remove/${dataset.name}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log(data.message);
                onRemove(dataset.name);
                handleClose();
            })
            .catch((error) => {
                console.error('Error removing dataset:', error);
            });
    };

    function redirectToDataPage() {
        let path = '/data/' + dataset.name;
        navigation(path)
    }

    return (
        <>
            <Accordion expanded={expanded} onChange={toggleExpanded}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel-content">
                    <Typography variant="h6">{dataset.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >

                        <Box
                            sx={{
                                bgcolor: 'lightgray',
                                p: 2,
                                borderRadius: 4,
                                minWidth: 160,
                                flex: '1 0 auto',
                                mb: 2,
                            }}
                        >
                            <Typography variant="subtitle1">Features</Typography>
                            <List sx={{ height: '100%', overflowY: 'auto', padding: '0'}}>
                                {Object.entries(dataset.features).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key} secondary={value} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        <Box
                            sx={{
                                bgcolor: 'lightgray',
                                p: 2,
                                borderRadius: 4,
                                minWidth: 160,
                                flex: '1 0 auto',
                                mb: 2,
                            }}
                        >
                            <Typography variant="subtitle1">Target</Typography>
                            <List sx={{ height: '100%', overflowY: 'auto', padding: '0'}}>
                                {Object.entries(dataset.target).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key} secondary={value} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        <Box
                            sx={{
                                bgcolor: 'lightgray',
                                p: 2,
                                borderRadius: 4,
                                minWidth: 160,
                                flex: '1 0 auto',
                                mb: 2,
                            }}
                        >
                            <Typography variant="subtitle1">Other Properties</Typography>
                            <List sx={{ height: '100%', overflowY: 'auto', padding: '0'}}>
                                {Object.entries(dataset).filter(([key]) => !['features', 'target', 'name'].includes(key)).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key} secondary={value === null || value === false ? "false" : value} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                        <Button
                            sx={{
                                bgcolor: 'gray',
                                ':hover': {
                                    bgcolor: 'darkgray'
                                }
                            }}
                            variant="contained"
                            onClick={redirectToDataPage}>DATA
                        </Button>

                        <Box>
                            <CopyButton sx={{bgcolor: '#00e676', display: 'flex', gap: 2 }} textToCopy={JSON.stringify(dataset)} />

                            <Button
                                sx={{
                                    bgcolor: '#ff9100',
                                    ':hover': {
                                        bgcolor: '#b26500'
                                    }
                                }}
                                variant="contained">EDIT
                            </Button>

                            <Button
                                sx={{
                                    bgcolor: '#d50000',
                                    ':hover': {
                                        bgcolor: '#950000'
                                    }
                                }}
                                variant="contained"
                                onClick={handleRemoveClick}>REMOVE
                            </Button>
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Remove"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to remove the dataset "{dataset.name}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Cancel</Button>
                    <Button onClick={handleConfirmRemove} color="secondary" autoFocus>Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CollapseComponent;
