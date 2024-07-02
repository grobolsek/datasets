import React, { useState } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';

const AutocompleteWithCustomOptions = ({ label, options }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [customOptions, setCustomOptions] = useState(options);

    const handleChange = (event, newValue) => {
        if (typeof newValue === 'string') {
            // Add a new custom option
            setCustomOptions([...customOptions, { label: newValue }]);
            setSelectedOption({ label: newValue });
        } else if (newValue && newValue.inputValue) {
            // Create a new value from the user input
            setCustomOptions([...customOptions, { label: newValue.inputValue }]);
            setSelectedOption({ label: newValue.inputValue });
        } else {
            setSelectedOption(newValue);
        }
    };

    return (
        <Box sx={{ width: 300, margin: '0 auto' }}>
            <Typography variant="h6" gutterBottom>
                {label}
            </Typography>
            <Autocomplete
                options={customOptions}
                getOptionLabel={(option) => {
                    // Value selected with enter, right from the input
                    if (typeof option === 'string') {
                        return option;
                    }
                    // Add "xxx" option created dynamically
                    if (option.inputValue) {
                        return option.inputValue;
                    }
                    // Regular option
                    return option.label;
                }}
                filterOptions={(options, params) => {
                    const filtered = options.filter((option) =>
                        option.label.toLowerCase().includes(params.inputValue.toLowerCase())
                    );

                    // Suggest the creation of a new value
                    if (params.inputValue !== '' && !filtered.some((option) => option.label === params.inputValue)) {
                        filtered.push({
                            inputValue: params.inputValue,
                            label: `Add "${params.inputValue}"`,
                        });
                    }

                    return filtered;
                }}
                value={selectedOption}
                onChange={handleChange}
                freeSolo
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Value"
                        placeholder="Choose value"
                    />
                )}
            />
        </Box>
    );
};

export default AutocompleteWithCustomOptions;
