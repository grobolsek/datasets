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
    Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CollapseComponent = ({ dataset }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const renderValue = (value) => {
        if (value === true) {
            return 'true';
        } else if (value === false) {
            return 'false';
        } else if (value === null) {
            return 'null';
        } else {
            return value;
        }
    };

    return (
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
                        gap: 16, // Adjust as needed for spacing between containers
                    }}
                >
                    {/* Features Container */}
                    <Box
                        sx={{
                            bgcolor: 'lightgray',
                            p: 2,
                            borderRadius: 4,
                            minWidth: 160, // Adjusted minWidth
                            flex: '1 0 auto', // Allow shrinking but not growing
                            mb: 2, // Margin bottom for spacing
                        }}
                    >
                        <Typography variant="subtitle1">Features</Typography>
                        <List sx={{ height: '100%', overflowY: 'auto' }}>
                            {Object.entries(dataset.features).map(([key, value]) => (
                                <ListItem key={key}>
                                    <ListItemText primary={key} secondary={renderValue(value)} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* Target Container */}
                    <Box
                        sx={{
                            bgcolor: 'lightgray',
                            p: 2,
                            borderRadius: 4,
                            minWidth: 160, // Adjusted minWidth
                            flex: '1 0 auto', // Allow shrinking but not growing
                            mb: 2, // Margin bottom for spacing
                        }}
                    >
                        <Typography variant="subtitle1">Target</Typography>
                        <List sx={{ height: '100%', overflowY: 'auto' }}>
                            {Object.entries(dataset.target).map(([key, value]) => (
                                <ListItem key={key}>
                                    <ListItemText primary={key} secondary={renderValue(value)} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* Other Properties Container */}
                    <Box
                        sx={{
                            bgcolor: 'lightgray',
                            p: 2,
                            borderRadius: 4,
                            minWidth: 160, // Adjusted minWidth
                            flex: '1 0 auto', // Allow shrinking but not growing
                            mb: 2, // Margin bottom for spacing
                        }}
                    >
                        <Typography variant="subtitle1">Other Properties</Typography>
                        <List sx={{ height: '100%', overflowY: 'auto', padding: '0'}}>
                            {Object.entries(dataset).filter(([key]) => !['features', 'target', 'name'].includes(key)).map(([key, value]) => (
                                <ListItem key={key}>
                                    <ListItemText primary={key} secondary={renderValue(value)} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'end'}}>
                    <Button sx={{ mx: 2, bgcolor: '#ff9100' }} variant="contained" color="secondary">EDIT</Button>
                    <Button sx={{ mx: 2, bgcolor: '#d50000' }} variant="contained" color="secondary">REMOVE</Button>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default CollapseComponent;
