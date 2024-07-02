import React from 'react';
import {useParams} from "react-router-dom";


const FileDownload = () => {
    const params = useParams()
    const filePath = '../../../../flask/.venv/Lib/site-packages/Orange/' + params.datasetName + '.tab'

    return (
        <div>
            <h1>Download .tab File</h1>
            <a href={filePath} download target="_blank" rel="noopener noreferrer">
                Open {params.datasetName + '.tab'} in a new tab
            </a>
        </div>
    );
};

export default FileDownload;