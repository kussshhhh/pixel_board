import React from 'react';

const ImageTag = ({ image, addTag }) => (
    <div>
        <input
            type="text"
            placeholder="Add tag"
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    addTag(image.id, e.target.value);
                    e.target.value = '';
                }
            }}
        />
        <ul>
            {image.tags.map((tag, index) => (
                <li key={index}>{tag}</li>
            ))}
        </ul>
    </div>
);

export default ImageTag;
