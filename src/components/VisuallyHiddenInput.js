import React from 'react';

const VisuallyHiddenInput = ({ type, onChange }) => (
    <input
        type={type}
        onChange={onChange}
        style={{
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
            opacity: 0,
        }}
        tabIndex={-1}
        aria-hidden="true"
    />
);

export default VisuallyHiddenInput;