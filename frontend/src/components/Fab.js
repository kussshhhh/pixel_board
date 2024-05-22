import React from 'react';
import './Fab.css';

const Fab = ({ onClick }) => (
    <button className="fab" onClick={onClick}>
        +
    </button>
);

export default Fab;
