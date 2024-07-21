import React, { useState  } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography, // Ensure Typography is imported from MUI
    Chip,
    Box,
    IconButton,
    Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteForeverIcon from '@mui/icons-material/DeleteForeverRounded';

const CollapseComponent = ({ dataset: initialDataset, startEdit, onRemove,
                               expanded, onChange }) => {
    const [dataset, setDataset] = useState(initialDataset);

    const handleRemoveClick = (e) => {
        e.stopPropagation();
        onRemove();
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        startEdit();
    };

    return (
        <>
            <Accordion className="dataset-box" expanded={expanded} onChange={onChange}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel-content"
                    sx={{ display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between' }}
                    style={{margin: 0}}
                >
                    <Box sx={{display: 'flex', flexGrow: 1}}>
                      <Typography variant="button" sx={{fontSize: "1.1em"}}>
                          {dataset.name}
                      </Typography>
                        {  dataset.tags && dataset.tags.map((tag) =>
                            <Chip variant="outlined" label={tag} key={tag}
                            sx={{mx: 1}}/>)
                        }
                    </Box>
                    <Box
                        className="actions"
                        variant="contained"
                        sx={{
                            display: 'flex',
                            transition: 'opacity 0.4s ease',
                            mx: 2
                        }}
                    >
                        <IconButton onClick={handleEditClick}>
                            <EditRoundedIcon />
                        </IconButton>
                        <IconButton onClick={handleRemoveClick}>
                            <DeleteForeverIcon />
                        </IconButton>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2, m: 0 }}>
                    <Box sx={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap', maxHeight: '500px', overflowY: 'auto', }}>
                        <Typography variant="overline" my={1}>
                            <b>{dataset.instances}</b> instances,&nbsp;
                            <b>{dataset.variables}</b> variables,&nbsp;
                            <b>{dataset.target.replace("none", "no")}</b> target.&nbsp;
                            {!!dataset.language && dataset.language !== "English" &&
                                <><b>{dataset.language}</b>. </>}
                            {dataset.collection && <>
                                Source: <b>{dataset.collection}{!!dataset.year && ", " + dataset.year}.</b>
                            </>}
                        </Typography>
                        <Divider />
                        <Typography mt={2} mb={4}>
                            {dataset.description}
                        </Typography>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

export default CollapseComponent;
