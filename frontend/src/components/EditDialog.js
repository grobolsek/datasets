import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Box, Typography } from '@mui/material';
import CustomAutocomplete from './MultiAutoComplete';

const EditDialog = ({ open, onClose, dataset, onSave }) => {
    const [editedData, setEditedData] = useState({
        title: '',
        collection: '',
        description: '',
        custom: '',
        references: [],
        version: '1.0',
        tags: [],
        languages: [],
        domains: [],
    });

    const [initialData, setInitialData] = useState({});

    useEffect(() => {
        console.log('Dataset:', dataset); // Log dataset to inspect its contents
        if (dataset) {
            const initial = {
                title: dataset.db_title || '',
                collection: dataset.db_collection || '',
                description: dataset.db_description || '',
                custom: dataset.db_custom || '',
                references: dataset.db_references ? dataset.db_references.split('\n') : [],
                version: dataset.db_version || '1.0',
                tags: dataset.db_tags || [],
                languages: dataset.db_languages || [],
                domains: dataset.db_domains || [],
                name: dataset.db_name || [],
            };
            setEditedData(initial);
            setInitialData(initial);
        }
    }, [dataset]);

    const handleChange = (name, newValue) => {
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
        const updatedData = {};
        Object.keys(editedData).forEach(key => {
            if (Array.isArray(editedData[key])) {
                if (editedData[key].toString() !== initialData[key].toString()) {
                    updatedData[key] = editedData[key];
                }
            } else if (editedData[key] !== initialData[key]) {
                updatedData[key] = editedData[key];
            }
        });
        onSave(updatedData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Edit Dataset {editedData.name}</DialogTitle>
            <DialogContent>
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
                <Box>
                    {editedData.references.map((reference, index) => (
                        <TextField
                            key={index}
                            fullWidth
                            label={`Reference ${index + 1}`}
                            name={`reference-${index}`}
                            value={reference}
                            onChange={(event) => handleReferenceChange(index, event)}
                            margin="normal"
                        />
                    ))}
                    <Button onClick={handleAddReference}>Add Reference</Button>
                </Box>
                <Box mt={2} display="flex" alignItems="center">
                    <Typography mr={2}>VERSION: {editedData.version}</Typography>
                    <Button onClick={handleVersionIncrease}>+1</Button>
                    <Button onClick={handleVersionDecrease}>-1</Button>
                </Box>
                {/* Example of CustomAutocomplete usage */}
                <CustomAutocomplete
                    placeholder="Tags"
                    tableName="tags/tag"
                    selectedItems={editedData.tags}
                />
                <CustomAutocomplete
                    placeholder="Languages"
                    tableName="languages/language"
                    selectedItems={editedData.languages}
                />
                <CustomAutocomplete
                    placeholder="Domains"
                    tableName="domains/domain"
                    selectedItems={editedData.domains}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancel</Button>
                <Button onClick={handleSave} color="secondary">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDialog;
