import React, { useState } from 'react';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';

const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 1500); // Reset copied state after 1.5 seconds
            })
            .catch((err) => {
                console.error('Could not copy text: ', err);
            });
    };

    return (
        <Button
            variant="contained"
            color={copied ? 'success' : 'primary'}
            startIcon={copied ? <DoneIcon /> : <ContentCopyIcon />}
            onClick={handleCopy}
            sx={{
                bgcolor: '#3d5afe',
                ':hover': {
                    bgcolor: '#2a3eb1'
                }
            }}
        >
            {copied ? 'COPIED' : 'Copy'}
        </Button>
    );
};

export default CopyButton;
