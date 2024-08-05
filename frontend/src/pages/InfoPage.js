import React, {
    useEffect,
    useState,
    useCallback } from 'react';
import {
    Box,
    Button,
    Chip,
    Container,
    IconButton,
    InputAdornment,
    Typography,
    Card,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    TextField} from '@mui/material';

import ClearIcon from "@mui/icons-material/Clear";

import EditDialog from '../components/EditDialog'; // Import EditDialog component
import CustomAutocomplete from "../components/MultiAutoComplete";

const InfoPage = () => {
    const [datasets, setDatasets] = useState(null);
    const [domains, setDomains] = useState(null);

    const [error, setError] = useState(null);

    const [edited, setEdited] = useState(null);
    const [domainFilter, setDomainFilter] = useState("");
    const [filter, setFilter] = useState("");

    useEffect(() => {
        fetch('/get')
            .then((response) => response.json())
            .then((data) => setDatasets(data))
        fetch('/domains')
            .then((response) => response.json())
            .then((data) => setDomains(data))
    }, []);

    const handleCloseEditDialog = useCallback((newData, reason) => {
        if (reason === "backdropClick") {
            return;
        }
        if (newData) {
            setDatasets((prevDatasets) => ({
                ...prevDatasets,
                [edited]: newData
            }));
        }
        setEdited(null);
    }, [edited]);

    const handleRemoveDataset = useCallback((dataset_id) => {
        // ask for confirmation before removing
        if (!window.confirm(
            `Are you sure you want to remove dataset ${datasets[dataset_id].name}?`)
        ) {
            return;
        }
        fetch(`/remove/${dataset_id}`)
            .then((response) => {
                if (!response.ok) {
                    response.text().then((text) => {
                        throw new Error(text);
                    })
                }
                setDatasets((prevDatasets) =>
                    Object.fromEntries(
                        Object.entries(prevDatasets)
                            .filter(([location]) => location !== dataset_id)
                    )
                );
                setEdited(null);
            })
            .catch((error) => setError(error));
    }, [datasets]);

    const filterDatasets = useCallback((dataset) =>
        (!domainFilter || dataset.domain === domainFilter)
        && (!filter ||
            Object.values(dataset)
                .join("\n")
                .toLowerCase()
                .includes(filter.trim().toLowerCase())
        ), [domainFilter, filter]);

    return (
        error ? <p>Error: {error.message}</p> :
            datasets === null || domains === null ? <p>Loading...</p> :
        <Container disableGutters>
            <Box sx={{
                my: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'}}
            >
                <FormControl
                    size="small"
                    sx={{m: 1, minWidth: "10em"}}
                >
                    <Button
                        variant="contained"
                        onClick={() => setEdited(-1)}
                    >
                        New Data Set
                    </Button>
                </FormControl>
                <Box>
                    <FormControl
                        size="small"
                        sx={{m: 1, minWidth: "15em"}}
                    >
                        <TextField
                            label="Filter"
                            variant="outlined"
                            value={filter}
                            size="small"
                            onChange={(event) => setFilter(event.target.value)}
                            InputProps={ filter ? {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setFilter("")}>
                                            <ClearIcon fontSize="small"/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            } : {}}
                        />
                    </FormControl>
                    <FormControl
                        size="small"
                        sx={{
                            m: 1,
                            minWidth: "10em"}}
                    >
                        <InputLabel id="domain-filter-label">
                            Domain Filter
                        </InputLabel>
                        <Select
                            labelId="domain-filter-label"
                            label="Domain Filter"
                            variant="outlined"
                            value={domainFilter}
                            autoWidth
                            onChange={(event) => setDomainFilter(event.target.value)}
                        >
                            <MenuItem value="">
                                (All Domains)
                            </MenuItem>
                            {domains && domains.map((domain) =>
                                <MenuItem value={domain} key={domain}>
                                    {domain}
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            {Object.entries(datasets)
                .filter(([, dataset]) => filterDatasets(dataset))
                .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                .map(([dataset_id, dataset]) => (
                    <Card
                        key={`${dataset_id}-${dataset.version}`}
                        variant="elevation"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            m: 1,
                            backgroundColor: "inherit",
                            transition: "background-color 0.5s ease-in-out",
                            '&:hover': {
                                backgroundColor: "#eee",
                            }
                        }}
                        onClick={() => setEdited(dataset_id)}
                    >
                        <Box sx={{
                            display: 'flex',
                            flexGrow: 1}}
                        >
                            <Typography
                                variant="button"
                                sx={{fontSize: "1.1em"}}
                            >
                                {dataset.name}
                            </Typography>
                            {  dataset.tags && dataset.tags.map((tag) =>
                                <Chip
                                    variant="outlined"
                                    label={tag}
                                    key={tag}
                                    sx={{mx: 1}}
                                />)
                            }
                        </Box>
                        { dataset.domain && dataset.domain !== "core" &&
                            <Chip label={dataset.domain} />
                        }
                    </Card>
              ))
            }
            {edited &&
                <EditDialog
                    initialData={datasets[edited]}
                    onClose={handleCloseEditDialog}
                    onRemove={() => handleRemoveDataset(edited)}
                >
                    <CustomAutocomplete
                        options={[]}
                        value={datasets[edited]?.tags || []}
                        placeholder="Add Tags"
                    />
                </EditDialog>
            }
        </Container>
    );
};

export default InfoPage;
