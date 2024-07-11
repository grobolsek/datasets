// EditDialog.js
import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Box } from '@mui/material';

const EditDialog = ({ open, onClose, dataset, onSave }) => {
    const [editedData, setEditedData] = useState(dataset);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSave = () => {
        onSave(editedData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Dataset</DialogTitle>
            <DialogContent>
                {Object.keys(dataset).map(key => (
                    <Box key={key} sx={{ my: 1 }}>
                        <TextField
                            label={key}
                            name={key}
                            value={editedData[key] || ''}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancel</Button>
                <Button onClick={handleSave} color="secondary">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDialog;
