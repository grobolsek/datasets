import React, { useEffect, useState } from 'react';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MultiAutoComplete from "../components/MultiAutoComplete";
import SingleAutoComplete from "../components/SingleAutoComplete";
import { FileUpload } from "../components/FileUpload";

const AddPage = () => {
    const [editedData, setEditedData] = useState({
        title: '',
        collection: '',
        description: '',
        custom: '',
        references: [],
        version: '1.0',
        tags: [],
        language: '',
        domain: '',
        name: '',
    });

    const [tableData, setTableData] = useState({
        'tags/tag': [],
        'languages/language': [],
        'domains/domain': [],
    });

    useEffect(() => {
        const tableNames = ['tags/tag', 'languages/language', 'domains/domain'];

        const fetchTableData = async (tableName) => {
            try {
                const response = await fetch(`/api/${tableName}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${tableName}`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Error fetching ${tableName} data:`, error);
                return [];
            }
        };

        const fetchData = async () => {
            const dataPromises = tableNames.map(tableName => fetchTableData(tableName));
            try {
                const results = await Promise.all(dataPromises);
                const newData = {};
                tableNames.forEach((tableName, index) => {
                    newData[tableName] = results[index];
                });
                setTableData(newData);
            } catch (error) {
                console.error('Error fetching table data:', error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (name, newValue) => {
        if (typeof newValue === 'object' && newValue.value) {
            newValue = newValue.value; // Use only the 'value' property
        }
        setEditedData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    const handleReferenceChange = (index, event) => {
        const newReferences = [...editedData.references];
        newReferences[index] = event.target.value;
        setEditedData(prevData => ({
            ...prevData,
            references: newReferences,
        }));
    };

    const handleAddReference = () => {
        setEditedData(prevData => ({
            ...prevData,
            references: [...prevData.references, ''],
        }));
    };

    const handleVersionIncrease = () => {
        const [major, minor] = editedData.version.split('.');
        const newVersion = `${parseInt(major) + 1}.${minor}`;
        setEditedData(prevData => ({
            ...prevData,
            version: newVersion,
        }));
    };

    const handleVersionDecrease = () => {
        const [major, minor] = editedData.version.split('.');
        if (parseInt(major) > 1) {
            const newVersion = `${parseInt(major) - 1}.${minor}`;
            setEditedData(prevData => ({
                ...prevData,
                version: newVersion,
            }));
        }
    };

    const handleSave = () => {
        fetch('/datasets/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editedData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Dataset added successfully:', data);
                // Optionally, handle success and navigate to another page
            })
            .catch(error => {
                console.error('Error adding dataset:', error);
            });
    };

    const getOptionLabel = (option) => {
        return option.value; // Adjust based on your options structure
    };

    return (
        <Container>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component="h1" variant="h4">
                    Add Dataset
                </Typography>
                <Button
                    component={Link}
                    to="/"
                    sx={{
                        bgcolor: '#f50057',
                        ':hover': {
                            bgcolor: '#c51162',
                        },
                    }}
                    variant="contained"
                >
                    Cancel
                </Button>
            </Box>
            <Box>
                <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={editedData.title}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Collection"
                    name="collection"
                    value={editedData.collection}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={editedData.description}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    margin="normal"
                    multiline
                />
                <TextField
                    fullWidth
                    label="Custom"
                    name="custom"
                    value={editedData.custom}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    margin="normal"
                    multiline
                />
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    border: "1px lightgray solid",
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    my: 2
                }}>
                    {editedData.references.map((reference, index) => (
                        <TextField
                            key={index}
                            fullWidth
                            label={`Reference ${index + 1}`}
                            name={`reference-${index}`}
                            value={reference}
                            onChange={(event) => handleReferenceChange(index, event)}
                            margin="normal"
                            multiline={true}
                        />
                    ))}
                    <Button sx={{ py: "0px" }} onClick={handleAddReference}>Add Reference</Button>
                </Box>
                <Box sx={{
                    my: 2,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    border: "1px lightgray solid",
                    px: 2,
                    py: 1,
                    gap: 1,
                    mt: 3
                }}>
                    <Typography mr={2}>VERSION: {editedData.version}</Typography>
                    <Button variant="outlined" sx={{ p: "0px" }} onClick={handleVersionIncrease}>+1</Button>
                    <Button variant="outlined" sx={{ p: "0px" }} onClick={handleVersionDecrease}>-1</Button>
                </Box>
                <MultiAutoComplete
                    options={tableData['tags/tag']}
                    placeholder="Tags"
                    values={editedData.tags}
                    onChange={(newTags) => handleChange('tags', newTags)}
                    getOptionLabel={getOptionLabel}
                />
                <SingleAutoComplete
                    options={tableData['languages/language']}
                    placeholder="Language"
                    value={editedData.language} // Changed to 'language' instead of 'languages'
                    onChange={(newLanguage) => handleChange('language', newLanguage)} // Changed to 'language' instead of 'languages'
                    getOptionLabel={getOptionLabel}
                />
                <SingleAutoComplete
                    options={tableData['domains/domain']}
                    placeholder="Domain"
                    value={editedData.domain} // Changed to 'domain' instead of 'domains'
                    onChange={(newDomain) => handleChange('domain', newDomain)} // Changed to 'domain' instead of 'domains'
                    getOptionLabel={getOptionLabel}
                />
                <FileUpload
                    accept=".xlsx"
                    t={(s) => s}
                    errorText=""
                    onFileUpload={(file) => new Promise((resolve) => {
                        console.log('File uploaded:', file);
                        resolve();
                    })}
                    hide={false}
                />
                <Button
                    variant="contained"
                    onClick={handleSave}
                    color="primary"
                >
                    Save
                </Button>
            </Box>
        </Container>
    );
};

export default AddPage;
