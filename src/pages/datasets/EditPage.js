import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {Container} from "@mui/material";

const AutocompleteWithCustomOptions = ({ label }) => {
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [customOptions, setCustomOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/get/info')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setOptions(data.name); // Assuming the API returns an object with a 'name' array
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching options:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    const handleChange = (event, newValue) => {
        if (typeof newValue === 'string') {
            // Add a new custom option
            const newOption = { label: newValue };
            setCustomOptions([...customOptions, newOption]);
            setSelectedOption(newOption);
        } else if (newValue && newValue.inputValue) {
            // Create a new value from the user input
            const newOption = { label: newValue.inputValue };
            setCustomOptions([...customOptions, newOption]);
            setSelectedOption(newOption);
        } else {
            setSelectedOption(newValue);
        }
    };

    const combinedOptions = [...options.map(option => ({ label: option })), ...customOptions];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;


    return (
        <Container>

        </Container>
    )
};

export default AutocompleteWithCustomOptions;
