import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';

const SingleAutoComplete = ({ options, placeholder, value, onChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedValue, setSelectedValue] = useState(value);

    // Update local state when value prop changes (e.g., if controlled externally)
    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    const handleInputChange = (event, newInputValue) => {
        setInputValue(newInputValue);
    };

    const handleChange = (event, newValue) => {
        setSelectedValue(newValue);
        // Pass the updated value back to the parent component
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleAddOption = () => {
        if (inputValue.trim() !== '' && !options.some(option => option.label === inputValue)) {
            const newOption = { label: inputValue, value: inputValue.toLowerCase() };
            const updatedOptions = [...options, newOption];
            setSelectedValue(newOption);
            setInputValue('');
            // Notify parent component of the change
            if (onChange) {
                onChange(newOption);
            }
        }
    };

    return (
        <Autocomplete
            id="single-choice-autocomplete"
            options={options}
            onChange={handleChange}
            value={selectedValue}
            inputValue={inputValue}
            sx={{mt:3}}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.label || option}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label={placeholder}
                    placeholder="Select or type new option"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {params.InputProps.endAdornment}
                                <Button onClick={handleAddOption}>Add</Button>
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
};

export default SingleAutoComplete;
