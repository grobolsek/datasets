import React from 'react';
import { Container } from '@mui/material';
import MultiChoiceAutocomplete from '../../components/Default-CustomComponent';

const EditPage = () => {
    const handleSelectedDatasets = (selectedDatasets) => {
        console.log('Selected Datasets:', selectedDatasets);
    };

    return (
        <Container>
            <MultiChoiceAutocomplete
                label="Select Datasets"
                onChange={handleSelectedDatasets}
            />
        </Container>
    );
};

export default EditPage;
