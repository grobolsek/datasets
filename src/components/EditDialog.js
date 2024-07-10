import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button
} from '@mui/material';

const EditDialog = ({ open, onClose, dataset, onSave }) => {
    const [formData, setFormData] = useState({ ...dataset });

    useEffect(() => {
        setFormData({ ...dataset }); // Reset form data when dataset changes
    }, [dataset]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // Determine changed fields
        const changedFields = {};
        for (const key in formData) {
            if (formData[key] !== dataset[key]) {
                changedFields[key] = formData[key];
            }
        }

        onSave(changedFields); // Send only changed fields to parent component
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Edit Dataset: {dataset.db_name}</DialogTitle>
            <DialogContent>
                {Object.keys(dataset).filter(key => key.startsWith('db_')).map((key) => (
                    <TextField
                        key={key}
                        name={key}
                        label={key.substring(3)}
                        value={formData[key] || ''}
                        onChange={handleChange}
                        margin="dense"
                        fullWidth
                    />
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDialog;
