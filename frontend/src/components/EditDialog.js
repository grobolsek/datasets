import React, {
    useEffect,
    useState,
    useReducer,
    useCallback,
    useMemo } from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    IconButton,
    Stack,
    TextField,
    Typography,
    Tooltip,
    Alert, InputAdornment } from '@mui/material';

import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import RotateLeftRoundedIcon from '@mui/icons-material/RotateLeftRounded';
import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from "@mui/icons-material/Clear";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";

import { get_url } from '../utils';
import MultiAutoComplete from './MultiAutoComplete';

const ALLOWED_EXTENSIONS = ['xlsx', 'tab', 'csv'];

const different = (a, b) =>
    (Array.isArray(a)
        ? (a.length !== b.length || a.some((svalue, index) => svalue !== b[index]))
        : a !== b
    );

const UploadIcon = (props: SvgIconProps) =>
    <SvgIcon {...props}>
        <path
            d="m19.41 7.41-4.83-4.83c-.37-.37-.88-.58-1.41-.58H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8.83c0-.53-.21-1.04-.59-1.42M14.8 15H13v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H9.21c-.45 0-.67-.54-.35-.85l2.8-2.79c.2-.19.51-.19.71 0l2.79 2.79c.3.31.08.85-.36.85M14 9c-.55 0-1-.45-1-1V3.5L18.5 9z"></path>
    </SvgIcon>;

const getInitialState = (initialData) => ({
    name: initialData?.name || '',
    location: initialData?.location || '',
    collection: initialData?.collection || '',
    year: initialData?.year || new Date().getFullYear(),
    description: initialData?.description || '',
    custom: initialData?.custom || '',
    reference_list: initialData?.reference_list || '',
    version: initialData?.version || '1.0',
    tags: initialData?.tags || [],
    language: initialData?.language || 'English',
    domain: initialData?.domain || 'core',
    file: undefined
});

const EditDialog = ({initialData, onClose, onSave, onRemove}) => {
    const [editedData, setEditedData] = useReducer(
        (state, action) => ({...state, ...action}), getInitialState(initialData)
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
        setEditedData({[name]: newValue});
    }, []);

    const handleDownload = useCallback(() => {
        if (!initialData?.location) {
            return;
        }
        const url = get_url(initialData.location, initialData.domain);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = initialData.location.split('/').pop();
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }, [initialData?.location, initialData?.domain]);

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
        const updatedData = Object.fromEntries(
            Object.entries(editedData)
            .map(([key, value]) => [key, value, initialData && initialData[key]])
            .filter(([key, newValue, initValue]) => (
                newValue !== undefined
                && (initValue === undefined || different(newValue, initValue))
            )
        ));

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
        !!(editedData.name && (initialData || (editedData.location && editedData.file))),
        [editedData.name, editedData.location, editedData.file, initialData]
    )

    const adornment = useCallback((key) =>
        initialData && different(initialData[key], editedData[key]) ? {
                endAdornment: (
                    <InputAdornment position="end">
                        <Tooltip title="Reset to initial value">
                            <IconButton onClick={() => setEditedData({[key]: initialData?.[key]}) }>
                                <SettingsBackupRestoreIcon fontSize="small" sx={{ color: "blue"}}/>
                            </IconButton>
                        </Tooltip>
                    </InputAdornment>
                ),
            }
            : {}, [initialData, editedData]);

    const notifyChange = useCallback((key) =>
        initialData && different(initialData[key], editedData[key]) ? {
            '& fieldset': {
                border: "2px solid blue"
            }}
            : {}, [initialData, editedData]);

    return (
        languages == null || domains == null || tags == null ? <p>Loading...</p> :
        <Dialog
            className="edit-dialog"
            open
            onClose={(event, reason) => onClose(null, reason)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fullWidth
            maxWidth="lg"
        >
        { !!error &&
            <Alert
                severity="error"
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2 }}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => { setError(null); } }
                    >
                        <CloseIcon
                            fontSize="inherit" />
                    </IconButton>
                }
            >
                {error}
            </Alert>
        }
        <DialogTitle
            sx={{
                backgroundColor: "#eee",
                height: "1.5em",
                mb: 3,
                pt: 0,
                pb: 3}}
        >
            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"}}
            >
                <Typography sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'}}
                    variant="h6"
                >
                    {initialData?.name || editedData.name || "[New data set]"}
                </Typography>
                <Stack
                    direction="row"
                >
                    <Tooltip title="Current version">
                        <Chip
                            mr={4}
                            label={editedData.version}/>
                    </Tooltip>
                    <IconButton
                        sx={{
                            p: "0px",
                            ml: 1}}
                        color="primary"
                        onClick={() => handleVersionClick()}
                    >
                        { initialData?.version && (
                             editedData.version === initialData?.version ? (
                                <Tooltip
                                    title="Increase major version; Minor version changes automatically when saving"
                                >
                                    <ArrowCircleUpRoundedIcon/>
                                </Tooltip>
                            ) : (
                                <Tooltip
                                    title={`Reset to current version, ${initialData?.version || "1.0"}`}
                                >
                                    <RotateLeftRoundedIcon/>
                                </Tooltip> )
                        )}
                    </IconButton>
                </Stack>
                <DialogActions className="actions">
                    { initialData?.location &&
                        <Tooltip title="Download data">
                            <IconButton
                                onClick={handleDownload}
                                disabled={!allowSave}
                                color="primary"
                            >
                                <FileDownloadIcon />
                            </IconButton>
                        </Tooltip>
                    }
                    <Tooltip title="Remove data set from collection">
                        <IconButton
                            onClick={() => onRemove()}
                            color="primary"
                        >
                            <DeleteForeverIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel changes">
                        <IconButton
                            onClick={() => onClose()}
                            color="primary"
                        >
                            <CloseIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Save changes">
                        <Button
                            onClick={handleSave}
                            disabled={!allowSave}
                            variant="contained"
                        >
                            Save
                        </Button>
                    </Tooltip>
                </DialogActions>
            </Box>
        </DialogTitle>
        <DialogContent
            spacing={50}
        >
            <Stack
                spacing={2}
                direction="row"
                sx={{pt: 1}}
            >
                <TextField
                    fullWidth
                    error={!editedData.name}
                    label="Name"
                    name="name"
                    value={editedData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    margin="normal"
                    sx={{flexBasis: "70%", ...notifyChange('name')}}
                    InputProps={adornment('name')}
                />
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: editedData.file ? "2px solid blue" : "1px lightgray solid",
                    borderRadius: 1,
                    p: 0.5,
                    marginTop: 0,
                    flexBasis: "30%"}}
                >
                    <input
                        id="file"
                        type="file"
                        accept={ALLOWED_EXTENSIONS.join(',')}
                        onChange={onFileChange}
                        onClick={onFileClick}
                        style={{display: 'none'}}
                    />
                    <Tooltip
                        title="Upload/Replace the file by clicking or dragging it to this dialog">
                    <label htmlFor="file">
                        <IconButton
                            onClick={onFileClick}
                            sx={{ pointerEvents: "none" }}
                            error={!editedData.location}
                        >
                            <UploadIcon sx={{
                                color: "darkBlue",
                                ml: 0,
                                mr: 1 }}
                            />
                            <Typography>
                                <nobr>
                                    { editedData.location }
                                </nobr>
                            </Typography>
                        </IconButton>
                    </label>
                    </Tooltip>
                    { !!editedData.file &&
                        <IconButton
                            onClick={() => setEditedData({file: null, location: initialData?.location || ""}) }
                        >
                            <SettingsBackupRestoreIcon
                                fontSize="small"
                                sx={{ color: "blue"}}
                            />
                        </IconButton>
                    }
                </Box>
            </Stack>
            <Stack
                spacing={2}
                direction="row"
                my={4}
            >
                <Box
                    sx={{flexBasis: "70%"}}
                >
                    <MultiAutoComplete
                        sx={{
                            flexGrow: 1,
                            ...notifyChange('tags')}}
                        options={tags}
                        label="Tags"
                        values={editedData.tags}
                        onChange={(newTags) => handleChange('tags', newTags)}
                    />
                </Box>
                <Box
                    sx={{flexBasis: "30%"}}
                >
                    <Autocomplete
                        freeSolo
                        renderInput={(params) => <TextField {...params} label="Domain" />}
                        options={domains}
                        placeholder="Domain"
                    value={editedData.domain}
                    onChange={(event, newDomain) => handleChange('domain', newDomain)}
                    onInputChange={(event, newDomain) => handleChange('domain', newDomain)}
                    sx={{
                        flexGrow: 1,
                        ...notifyChange('domain')}}
                    />
                </Box>
            </Stack>
            <Stack spacing={2} direction="row" my={2}>
                <TextField
                    sx={{
                        flexBasis: "70%",
                        borderColor: "black",
                        ...notifyChange('collection') }}
                    mt={0}
                    pt={0}
                    fullWidth
                    label="Collection"
                    name="collection"
                    value={editedData.collection}
                    onChange={(e) => handleChange("collection", e.target.value)}
                    margin="normal"
                    InputProps={adornment('collection')}
                />
                <TextField
                    sx={{
                        flexBasis: "10%",
                        ...notifyChange('year')}}
                    mt={0}
                    pt={0}
                    fullWidth
                    label="Year"
                    name="year"
                    value={editedData.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    margin="normal"
                    InputProps={adornment('year')}
                />
                <Autocomplete
                    sx={{
                        flexBasis: "20%",
                        ...notifyChange('language')}}
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
                sx={{...notifyChange('description')}}
                label="Description"
                name="description"
                value={editedData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                margin="normal"
                multiline
                InputProps={adornment('description')}
            />
            <TextField
                fullWidth
                sx={{
                    mt: 4,
                    ...notifyChange('reference_list')}}
                label="References"
                name="reference_list"
                value={editedData.reference_list}
                onChange={(event) => handleChange("reference_list", event.target.value)}
                multiline={true}
                InputProps={adornment('reference_list')}
            />
            <TextField
                fullWidth
                sx={{
                    mt: 4,
                    ...notifyChange('custom')}}
                label="Custom data (YAML dictionary)"
                name="custom"
                value={editedData.custom}
                onChange={(e) => handleChange("custom", e.target.value)}
                margin="normal"
                multiline
                InputProps={adornment('custom')}
            />
        </DialogContent>
    </Dialog>
    );
};

export default EditDialog;
