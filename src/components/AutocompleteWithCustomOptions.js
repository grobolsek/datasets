import React, { useState } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip } from '@mui/material';

const AutocompleteWithCustomOptions = ({ label, options }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [customOptions, setCustomOptions] = useState(options);
    const [inputValue, setInputValue] = useState('');

    const handleChange = (event, newValue) => {
        if (newValue && newValue.length > 0) {
            const lastValue = newValue[newValue.length - 1];
            if (typeof lastValue === 'string') {
                const newOption = { label: lastValue };
                setCustomOptions([...customOptions, newOption]);
                setSelectedOptions([...selectedOptions, newOption]);
            } else if (lastValue && lastValue.inputValue) {
                const newOption = { label: lastValue.inputValue };
                setCustomOptions([...customOptions, newOption]);
                setSelectedOptions([...selectedOptions, newOption]);
            } else {
                setSelectedOptions(newValue);
            }
        } else {
            setSelectedOptions(newValue);
        }
    };

    return (
        <Box sx={{ width: 300, margin: '0 auto' }}>
            <Typography variant="h6" gutterBottom>
                {label}
            </Typography>
            <Autocomplete
                multiple
                freeSolo
                options={customOptions}
                value={selectedOptions}
                onChange={handleChange}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            label={option.label}
                            {...getTagProps({ index })}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Value"
                        placeholder="Choose or add a value"
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && inputValue) {
                                const newOption = { label: inputValue };
                                setCustomOptions([...customOptions, newOption]);
                                setSelectedOptions([...selectedOptions, newOption]);
                                setInputValue('');
                                event.preventDefault();
                            }
                        }}
                    />
                )}
            />
        </Box>
    );
};

export default AutocompleteWithCustomOptions;
