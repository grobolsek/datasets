import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';

const MultiAutoComplete = ({ tableName, placeholder, selectedItems }) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const response = await fetch(`/table/${tableName}`);
            if (!response.ok) {
                throw new Error('Failed to fetch options');
            }
            const data = await response.json();
            setOptions(data);
            console.log(data);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleAddOption = (event, value) => {
        // Create new option and add to state
        const newOption = { label: value };
        setOptions([...options, newOption]);
    };

    return (
        <Autocomplete
            multiple
            id="multi-autocomplete"
            options={options}
            getOptionLabel={(option) => option.label}
            defaultValue={selectedItems} // Initial selected items
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip key={index} label={option.label} {...getTagProps({ index })} />
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label={placeholder}
                    placeholder={placeholder}
                />
            )}
            freeSolo
            onChange={handleAddOption} // To handle adding custom options
        />
    );
};

export default MultiAutoComplete;
