import React, { useState } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';

const options = [
    { label: 'Dataset 1', value: 'dataset1' },
    { label: 'Dataset 2', value: 'dataset2' },
    { label: 'Dataset 3', value: 'dataset3' },
    // Add more options as needed
];

const MultiChoiceAutocomplete = ({ label, onChange }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleChange = (event, value) => {
        setSelectedOptions(value);
        onChange(value);
    };

    return (
        <Box sx={{ width: 300, margin: '0 auto' }}>
            <Typography variant="h6" gutterBottom>{label}</Typography>
            <Autocomplete
                multiple
                options={options}
                getOptionLabel={(option) => option.label}
                value={selectedOptions}
                onChange={handleChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Select Datasets"
                        placeholder="Choose datasets"
                    />
                )}
            />
        </Box>
    );
};

export default MultiChoiceAutocomplete;