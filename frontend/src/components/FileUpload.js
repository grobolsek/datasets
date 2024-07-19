import React, { useCallback, useState } from "react";

export const FileUpload = ({ accept, errorText, onFileUpload, hide = false }) => {
    const [fileName, setFileName] = useState(null);

    const onFileChange = useCallback((event) => {
        if (event.target.files) {
            setFileName(event.target.files[0].name);
            onFileUpload(event.target.files[0]).then(() => {
                event.target.value = "";
            });
        }
    }, [onFileUpload]);

    const onClick = useCallback((event) => {
        event.currentTarget.value = '';
        setFileName(null);
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        if (event.dataTransfer.items) {
            const file = event.dataTransfer.items[0].getAsFile();
            if (file) {
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

    return (
        <>
            <input
                id="file"
                type="file"
                accept={accept}
                onChange={onFileChange}
                onClick={onClick}
                style={{ display: 'none' }}
            />
            <label
                htmlFor="file"
                className="btn btn-primary"
                style={{ display: hide ? 'none' : 'block' }}
                onDrop={onDrop}
                onDragOver={onDragOver}
            >
                {fileName || "Upload File"}
            </label>
            <small className="text-danger" style={{ display: hide ? 'none' : 'block' }}>
                {errorText}
            </small>
        </>
    );
};
