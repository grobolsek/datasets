import React, { useEffect, useState } from 'react';
import {Box, Button, Container, TextField, Typography} from "@mui/material";
import AutocompleteWithCustomOptions from "../../components/AutocompleteWithCustomOptions";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VisuallyHiddenInput from "../../components/VisuallyHiddenInput";
import {Title} from "@mui/icons-material";


const AddPage = () => {
    const [options, setOptions] = useState([]);
    const [customOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/get/info/values/name')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setOptions(data.name);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching options:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    const combinedOptions = [...options.map(option => ({ label: option })), ...customOptions];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        console.log('Selected file:', file);
        // Handle file upload logic here
    };

    return (
        <Container sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h4" sx={{ mb: 2 }}>Create dataset</Typography>
            <Box sx={{ display: "flex", gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Box sx={{
                    px: 4,
                    py: 3,
                    gap: 1,
                    pt: 2,
                    border: '2px solid #ccc',
                    borderRadius: 3,
                    maxWidth: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography sx={{ fontWeight: 'bold' }}>main</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '300px', gap: 2 }}>
                        <TextField id="Name" label="Name" variant="outlined" />
                        <TextField id="Location" label="Location" variant="outlined" />
                        <AutocompleteWithCustomOptions
                            sx={{
                                width: '300px',
                            }}
                            label={"tags"}
                            options={combinedOptions}
                            placeholder={"Choose or add custom tag"}
                        />
                    </Box>
                </Box>
                <Box sx={{
                    px: 4,
                    py: 3,
                    gap: 1,
                    pt: 2,
                    border: '2px solid #ccc',
                    borderRadius: 3,
                    maxWidth: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography sx={{ fontWeight: 'bold' }}>features</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '300px', gap: 2 }}>
                        <TextField id="continuous" label="Continuous" variant="outlined" type="number"/>
                        <TextField id="discrete" label="Discrete" variant="outlined" type="number"/>
                        <TextField id="meta" label="Meta" variant="outlined" type="number"/>
                    </Box>
                </Box>
                <Box sx={{
                    px: 4,
                    py: 3,
                    pt: 2,
                    gap: 1,
                    border: '2px solid #ccc',
                    borderRadius: 3,
                    maxWidth: 'fit-content',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography sx={{ fontWeight: 'bold' }}>target</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '300px', gap: 2 }}>
                        <TextField id="type" label="Type" variant="outlined"/>
                        <TextField id="values" label="Values" variant="outlined" type="number"/>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4}}>
                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    Upload file
                    <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
                </Button>
            </Box>
        </Container>
    );
};

export default AddPage;
