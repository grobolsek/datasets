import React, {useEffect, useState} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {Button} from "@mui/material";

const MultiAutoComplete = ({ options, placeholder, values, onChange }) => {
    const [selectedValues, setSelectedValues] = useState(values);
    const [inputValue, setInputValue] = useState('');

    // Update local state when values prop changes (e.g., if controlled externally)
    React.useEffect(() => {
        setSelectedValues(values);
    }, [values]);

    const handleInputChange = (event, newInputValue) => {
        setInputValue(newInputValue);
    };

    const handleChange = (event, newValue) => {
        setSelectedValues(newValue);
        // Pass the updated values back to the parent component
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleAddOption = () => {
        if (inputValue.trim() !== '' && !selectedValues.includes(inputValue)) {
            const newOption = { label: inputValue, value: inputValue.toLowerCase() };
            setSelectedValues([...selectedValues, newOption]);
            setInputValue('');
            // Notify parent component of the change
            if (onChange) {
                onChange([...selectedValues, newOption]);
            }
        }
    };

    return (
        <Autocomplete
            multiple
            id="multi-choice-autocomplete"
            options={options}
            onChange={handleChange}
            value={selectedValues}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.label || option}
            sx={{mt:3}}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label={placeholder}
                    placeholder="Select or type new options"
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

export default MultiAutoComplete;
