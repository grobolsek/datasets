import React, { useEffect, useState, useReducer, useCallback } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import MultiAutoComplete from './MultiAutoComplete';
import SingleAutoComplete from "./SingleAutoComplete";
import { FileUpload } from "./FileUpload";

const EditDialog = ({ open, onClose, dataset, onSave }) => {
    const [editedData, setEditedData] = useReducer((state, action) => {
        return {...state, ...action};
        },
        {
            title: dataset.db_title || '',
            collection: dataset.db_collection || '',
            description: dataset.db_description || '',
            custom: dataset.db_custom || '',
            references: dataset.db_references ? dataset.db_references.split('\n') : [],
            version: dataset.db_version || '1.0',
            tags: dataset.db_tags || [],
            language: dataset.db_language || '', // Changed to 'language' instead of 'languages'
            domain: dataset.db_domain || '', // Changed to 'domain' instead of 'domains'
            name: dataset.db_name || '',
            file: null
        }
    );

    const [tableData, setTableData] = useState({});

    const fetchTableData = async (tableName) => {
        try {
            const response = await fetch(`/table/${tableName}`);
            if (!response.ok) {
                console.error(`Failed to fetch data for table ${tableName}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data for table ${tableName}:`, error);
            return null;
        }
    };

    useEffect(() => {
        const tableNames = ['tags/tag', 'languages/language', 'domains/domain']; // Replace with your table names
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

    const handleChange = useCallback((name, newValue) => {
        if (typeof newValue === 'object' && newValue.value) {
            newValue = newValue.value; // Use only the 'value' property
        }
        setEditedData({[name]: newValue});
    }, []);

    const handleReferenceChange = useCallback((index, event) => {
        const newReferences = [...editedData.references];
        newReferences[index] = event.target.value;
        setEditedData({references: newReferences});
    }, [editedData.references]);

    const handleAddReference = useCallback(() => {
        setEditedData({references: [...editedData.references, '']});
    }, []);

    const handleVersionIncrease = useCallback(() => {
        const [major, minor] = editedData.version.split('.');
        const newVersion = `${parseInt(major) + 1}.${minor}`;
        setEditedData({version: newVersion})
    }, [editedData.version, editedData.references]);

    const handleVersionDecrease = useCallback(() => {
        const [major, minor] = editedData.version.split('.');
        if (parseInt(major) > 1) {
            const newVersion = `${parseInt(major) - 1}.${minor}`;
            setEditedData(prevData => ({
                ...prevData,
                version: newVersion,
            }));
        }
    }, [editedData.version]);

    const handleSave = useCallback(() => {
        const updatedData = Object.fromEntries(
            Object.entries(editedData)
            .map(([key, value]) => [key, value, dataset[key]])
            .filter(([key, value, newValue]) => (newValue === undefined
              || (Array.isArray(value)
                 ? (value.length !== newValue.length ||
                    value.some((svalue, index) =>
                       svalue !== newValue[index])
                   )
                 : value !== newValue
                )
            )
        ));
        console.log(updatedData);
        onSave(updatedData);
        onClose();
    }, [editedData, dataset, onClose, onSave]);


    const onFileUpload = useCallback(async (file: File) => {
        (await file.arrayBuffer()).then(
            (fileContent) => setEditedData(prevData => ({...prevData, fileContent}))
        );
    }, []);

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
                    display:"flex",
                    alignItems:"center",
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
                />
                <SingleAutoComplete
                    options={tableData['languages/language']}
                    placeholder="Language"
                    value={editedData.language} // Changed to 'language' instead of 'languages'
                    onChange={(newLanguage) => handleChange('language', newLanguage)} // Changed to 'language' instead of 'languages'
                />
                <SingleAutoComplete
                    options={tableData['domains/domain']}
                    placeholder="Domain"
                    value={editedData.domain} // Changed to 'domain' instead of 'domains'
                    onChange={(newDomain) => handleChange('domain', newDomain)} // Changed to 'domain' instead of 'domains'
                />
                <FileUpload
                    accept=".xlsx"
                    errorText=""
                    onFileUpload={onFileUpload}
                    hide={false}
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
