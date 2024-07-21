import React, { useEffect, useState, useReducer, useCallback, useMemo } from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Stack,
    TextField,
    Typography,
    Tooltip,
    Alert
} from '@mui/material';
import MultiAutoComplete from './MultiAutoComplete';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import RotateLeftRoundedIcon from '@mui/icons-material/RotateLeftRounded';
import CloseIcon from '@mui/icons-material/Close';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';


const UploadIcon = (props: SvgIconProps) =>
    <SvgIcon {...props}>
            <path
                d="m19.41 7.41-4.83-4.83c-.37-.37-.88-.58-1.41-.58H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8.83c0-.53-.21-1.04-.59-1.42M14.8 15H13v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H9.21c-.45 0-.67-.54-.35-.85l2.8-2.79c.2-.19.51-.19.71 0l2.79 2.79c.3.31.08.85-.36.85M14 9c-.55 0-1-.45-1-1V3.5L18.5 9z"></path>
    </SvgIcon>;

const ALLOWED_EXTENSIONS = ['xlsx', 'tab', 'csv'];

const EditDialog = ({onClose, initialData, onSave}) => {
    const [editedData, setEditedData] = useReducer(
        (state, action) => ({...state, ...action}),
        {
            name: initialData?.name || '',
            location: initialData?.location || '',
            collection: initialData?.collection || '',
            description: initialData?.description || '',
            custom: initialData?.custom || '',
            reference_list: initialData?.reference_list || '',
            version: initialData?.version || '1.0',
            tags: initialData?.tags || [],
            language: initialData?.language || '', // Changed to 'language' instead of 'languages'
            domain: initialData?.domain || '', // Changed to 'domain' instead of 'domains'
            file: undefined
        }
    );
    const [error, setError] = useState(null);

    const [domains, setDomains] = useState(null);
    const [languages, setLanguages] = useState(null);
    const [tags, setTags] = useState(null);
    useEffect(() => {
        fetch('/domains')
            .then(res => res.json())
            .then(setDomains);
        fetch('/languages')
            .then(res => res.json())
            .then(setLanguages);
        fetch('/tags')
            .then(res => res.json())
            .then(setTags);
    }, []);

    const handleChange = useCallback((name, newValue) => {
        console.log("Setting", name, "to", newValue);
        setEditedData({[name]: newValue});
    }, []);

    const handleVersionClick = useCallback(() => {
        if (editedData.version === initialData?.version) {
            const [major] = editedData.version.split('.');
            const newVersion = `${parseInt(major) + 1}.0`;
            setEditedData({version: newVersion});
        }
        else {
            setEditedData({version: initialData?.version || "1.0"});
        }
    }, [editedData.version, initialData?.version]);

    const handleSave = useCallback(() => {
        console.log("Saving", editedData);
        const different = (a, b) =>
            (Array.isArray(a)
                ? (a.length !== b.length || a.some((svalue, index) => svalue !== b[index]))
                : a !== b
        );

        const updatedData = Object.fromEntries(
            Object.entries(editedData)
            .map(([key, value]) => [key, value, initialData && initialData[key]])
            .filter(([key, newValue, initValue]) => (
                newValue !== undefined
                && (initValue === undefined || different(newValue, initValue))
            )
        ));

        console.log("Updated data", JSON.stringify(updatedData));
        const formData = new FormData();
        if (editedData.file) {
            formData.append('file', editedData.file, editedData.file.name);
            updatedData['location'] = editedData.file.name;
        }
        formData.append('data', JSON.stringify(updatedData));
        fetch(`/edit/${initialData?.dataset_id || -1}`, {
            method: 'POST',
            body: formData
        })
            .then((response) => {
                if (!response.ok) {
                    console.log("not good");
                    response.text()
                        .then((text) =>
                            setError(`Error updating dataset: ${text || response.statusText}`));
                }
                return response.json();
            })
            .then(onClose)
            .catch((error) => {
                setError(`Error updating dataset: ${error}`);
            });
    }, [editedData, initialData, onClose]);

    const onFileUpload = useCallback(async (file: File) => {
        console.log("XX", file.name);
        setEditedData({file, location: file.name});
    }, []);

    const [fileName, setFileName] = useState(null);

    const onFileChange = useCallback((event) => {
        if (event.target.files) {
            setFileName(event.target.files[0].name);
            onFileUpload(event.target.files[0]).then(() => {
                event.target.value = "";
            });
        }
    }, [onFileUpload]);

    const onFileClick = useCallback((event) => {
        event.currentTarget.value = '';
        setFileName(null);
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        if (event.dataTransfer.items) {
            const file = event.dataTransfer.items[0].getAsFile();
            if (file && ALLOWED_EXTENSIONS.includes(file.name.split('.').pop())) {
                setFileName(file.name);
                onFileUpload(file).then(() => {
                    document.getElementById('file').value = "";
                });
            }
        }
    }, [onFileUpload]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
    }, []);

    const allowSave = useMemo(() =>
        !!(initialData || (editedData.name && editedData.location && editedData.file)),
        [editedData.name, editedData.location, editedData.file, initialData]
    )

    console.log("Domains", domains, "Languages", languages, "Tags", tags);
    return (
        languages == null || domains == null || tags == null ? <p>Loading...</p> :
        <Dialog
                open
                onClose={(event, reason) => onClose(null, reason)}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fullWidth
                maxWidth="md">
            { !!error &&
                <Alert
                    severity="error"
                    sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2 }}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => { setError(null); } }
                        >
                        <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            }
            <DialogContent spacing={50}>
                <Stack spacing={2} direction="row">
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={editedData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        margin="normal"
                        sx={{flexGrow: 1}}
                    />
                    <Box sx={{display: "flex", alignItems: "center", border: "1px lightgray solid", borderRadius: 1, px: 1, py: 1}}>
                        <input
                            id="file"
                            type="file"
                            accept={ALLOWED_EXTENSIONS.join(',')}
                            onChange={onFileChange}
                            onClick={onFileClick}
                            style={{display: 'none'}}
                        />
                        <Tooltip title="Upload/Replace the file by clicking or dragging it to this dialog">
                        <label htmlFor="file">
                            <IconButton onClick={onFileClick} sx ={{ pointerEvents: "none" }} >
                                <UploadIcon sx={{ color: "darkBlue", ml: 0, mr: 1 }}/>
                                <Typography>
                                    <nobr>{ editedData.location }</nobr>
                                </Typography>
                            </IconButton>
                        </label>
                        </Tooltip>
                    </Box>
                    <Box sx={{
                        my: 2,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        border: "1px lightgray solid",
                        px: 2,
                        py: 1,
                        gap: 1,
                        mt: 3
                    }}>
                        <Tooltip title="Current version">
                        <Chip mr={2} label={editedData.version}/>
                        </Tooltip>
                        <Tooltip title="Minor version changes automatically when saving">
                        <IconButton sx={{p: "0px"}} onClick={() => handleVersionClick()}>
                            {editedData.version === initialData?.version
                                ? <ArrowCircleUpRoundedIcon/>
                                : <RotateLeftRoundedIcon/>
                            }
                        </IconButton>
                        </Tooltip>
                    </Box>
                </Stack>
                <Stack spacing={2} direction="row" my={4}>
                    <Box sx={{flexBasis: "70%"}}>
                        <MultiAutoComplete
                            options={tags}
                            placeholder="Tags"
                            values={editedData.tags}
                            onChange={(newTags) => handleChange('tags', newTags)}
                        />
                    </Box>
                    <Box sx={{flexBasis: "30%"}}>
                        <Autocomplete
                            freeSolo
                            renderInput={(params) => <TextField {...params} label="Domain" />}
                            options={domains}
                            placeholder="Domain"
                        value={editedData.domain} // Changed to 'domain' instead of 'domains'
                        onChange={(event, newDomain) => handleChange('domain', newDomain)} // Changed to 'domain' instead of 'domains'
                        onInputChange={(event, newDomain) => handleChange('domain', newDomain)} // Changed to 'domain' instead of 'domains'
                        sx={{flexGrow: 1}}
                        />
                    </Box>
                </Stack>
                <Stack spacing={2} direction="row" my={2}>
                    <TextField
                        sx={{flexBasis: "70%"}}
                        mt={0}
                        pt={0}
                        fullWidth
                        label="Collection"
                        name="collection"
                        value={editedData.collection}
                        onChange={(e) => handleChange("collection", e.target.value)}
                        margin="normal"
                    />
                    <Autocomplete
                        sx={{flexBasis: "30%"}}
                        options={languages}
                        renderInput={(params) => <TextField {...params} label="Language" />}
                        freeSolo
                        placeholder="Language"
                        value={editedData.language} // Changed to 'language' instead of 'languages'
                        onChange={(event, newLanguage) => handleChange('language', newLanguage)} // Changed to 'language' instead of 'languages'
                        onInputChange={(event, newLanguage) => handleChange('language', newLanguage)} // Changed to 'language' instead of 'languages'
                    />
                </Stack>

                <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={editedData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    margin="normal"
                    multiline
                />
                <TextField
                    fullWidth
                    sx={{mt: 4}}
                    label="References"
                    name="reference_list"
                    value={editedData.reference_list}
                    onChange={(event) => handleChange("reference_list", event.target.value)}
                    multiline={true}
                />
                <TextField
                    fullWidth
                    sx={{mt: 4}}
                    label="Custom data (YAML dictionary)"
                    name="custom"
                    value={editedData.custom}
                    onChange={(e) => handleChange("custom", e.target.value)}
                    margin="normal"
                    multiline
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()} color="primary">Cancel</Button>
                <Button onClick={handleSave} disabled={!allowSave} color="secondary">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDialog;
