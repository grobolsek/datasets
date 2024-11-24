import React, {useState} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {Button} from "@mui/material";

const MultiAutoComplete = ({ options, label, placeholder, values, onChange, sx }) => {
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
        onChange(newValue);
    };

    const handleAddOption = () => {
        if (inputValue.trim() !== '' && !selectedValues.includes(inputValue)) {
            const newOption = inputValue.toLowerCase();
            setSelectedValues([...selectedValues, newOption]);
            setInputValue('');
            onChange([...selectedValues, newOption]);
        }
    };

    return (
        <Autocomplete
            multiple
            freeSolo
            sx={sx}
            id="multi-choice-autocomplete"
            options={options}
            onChange={handleChange}
            value={selectedValues}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.label || option}
            disableClearable

            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label={label}
                    placeholder={placeholder || "Select or type ..."}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {params.InputProps.endAdornment}
                                { !!inputValue.trim() &&
                                <Button
                                        onClick={handleAddOption}
                                        sx={{textTransform: "none"}}>
                                    ADD '{inputValue.trim()}'
                                </Button>
                                }
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
};

export default MultiAutoComplete;
