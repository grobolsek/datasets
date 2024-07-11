import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';

const AutocompleteWithCustomOptions = ({ placeholder, label, tableName, value, onChange }) => {
    const [customOptions, setCustomOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        // Fetch existing tags for the specified tableName
        fetch(`/datasets/table/${tableName}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch tags');
                }
                return response.json();
            })
            .then((data) => {
                // Prepare options with fetched tags
                const fetchedOptions = data.map(tag => ({ label: tag }));
                setCustomOptions(fetchedOptions);
            })
            .catch((error) => {
                console.error('Error fetching tags:', error);
            });
    }, [tableName]);

    const handleChange = (event, newValue) => {
        const newTags = newValue.map(option => {
            if (typeof option === 'string') {
                return option;
            } else if (option && option.label) {
                return option.label;
            }
            return null;
        }).filter(tag => tag !== null);

        onChange(newTags);
    };

    return (
        <Autocomplete
            multiple
            freeSolo
            options={customOptions}
            getOptionLabel={(option) => option.label || ''}
            value={value.map(tag => ({ label: tag }))}
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
                    label={label}
                    placeholder={placeholder}
                />
            )}
        />
    );
};

export default AutocompleteWithCustomOptions;
