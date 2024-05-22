import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import ImageTag from './components/ImageTag';
import Fab from './components/Fab';

function App() {
    const [images, setImages] = useState([]);

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new window.Image();
            img.src = reader.result;
            img.onload = () => {
                setImages((prevImages) => [
                    ...prevImages,
                    { id: Date.now(), img, x: 50, y: 50, tags: [] }
                ]);
            };
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                handleFile(file);
                break;
            }
        }
    };

    const addTag = (id, tag) => {
        setImages(images.map(image => {
            if (image.id === id) {
                return { ...image, tags: [...image.tags, tag] };
            }
            return image;
        }));
    };

    useEffect(() => {
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, []);

    const handleFabClick = () => {
        document.getElementById('fileInput').click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    return (
        <div>
            <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
                accept="image/*"
            />
            <Canvas
                images={images}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            />
            {images.map((image) => (
                <ImageTag key={image.id} image={image} addTag={addTag} />
            ))}
            <Fab onClick={handleFabClick} />
        </div>
    );
}

export default App;
