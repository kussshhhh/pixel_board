import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import ImageTag from './components/ImageTag';
import Fab from './components/Fab';
import axios from 'axios' ;

function App() {
    const [images, setImages] = useState([]); 
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [imagesToDelete, setImagesToDelete] = useState([]) ;

    const markImageForDeletion = (imageId) => {
        setImagesToDelete((prev) => [...prev, imageId]) ;
    } ;

    useEffect(() => {
        axios.get('http://localhost:3001/images')
            .then(response => {
                console.log(response);
            
                const data = response.data;
                const imgArr = data.filter(image => image.src !== null);
            
                const loadedImages = imgArr.map(imageData => {
                    const img = new window.Image();
                    img.src = imageData.src;
                
                    return {
                        id: imageData.id,
                        img: img,  // Store the actual Image object here
                        src: imageData.src,
                        x: imageData.x,
                        y: imageData.y,
                        tags: imageData.tags,
                        showControls: false,
                    };
                });
            

                // Wait for all images to load before updating state
                    const imageLoadPromises = loadedImages.map(image => {
                    return new Promise((resolve, reject) => {
                        image.img.onload = resolve;
                        image.img.onerror = reject;
                    });
                });
            
                Promise.all(imageLoadPromises)
                    .then(() => {
                        setImages(loadedImages);
                        console.log("done");
                    })
                    .catch(error => console.error('Error loading images:', error));
            })
            .catch(error => console.error('Error fetching images:', error));
    }, []);



    const handleDoubleClick = (id) => {
        setSelectedImageId(id);
    };

    
    // const handleFile = (file, x, y) => {
    //     const reader = new FileReader(); 
    //     reader.onload = () => {
    //         const src = reader.result; // base64 string
    //         const newImage = { id: Date.now(), src, x, y, tags: [], showControls: false };
    //         setImages((prevImages) => {
    //             const updatedImages = [...prevImages, newImage];
    //             setUndoStack([...undoStack, { type: 'add', image: newImage }]);
    //             // saveImage({ src, x, y, tags: [] }); // Save to backend without showControls
    //             return updatedImages;
    //         });
    //     };
    //     reader.readAsDataURL(file);
    // };

    const handleFile = (file, x, y) => {
        const reader = new FileReader(); 
        reader.onload = () => {
            const img = new window.Image();
            const src = reader.result ;
            img.src = src;
            img.onload = () => {
                const newImage = { id: Date.now(), img, x, y, tags: [], showControls: false };
                setImages((prevImages) => {
                    const updatedImages = [...prevImages, newImage];
                    setUndoStack([...undoStack, { type: 'add', image: newImage }]);

                    saveImage({id : newImage.id, src : src, x : newImage.x, y: newImage.y, tags : newImage.tags }) ;
                    console.log(src) ; 
                    return updatedImages;
                });
            };
        };
        reader.readAsDataURL(file);
    };

    const saveImage = (image) => {
        axios.post('http://localhost:3001/images', image)
            .then(() => {
                console.log('Image saved successfully');
            })
            .catch(error => {
                console.error('Error saving image:', error);
            });
    };


    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        setMousePosition({ x: mouseX, y: mouseY });
        handleFile(file, mouseX, mouseY);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                handleFile(file, mousePosition.x, mousePosition.y);
                break;
            }
        }
    };

    const addTag = (id, tag) => {
        setImages(images.map(image => {
            if (image.id === id) {
                const updatedImage = { ...image, tags: [...image.tags, tag] };
                setUndoStack([...undoStack, { type: 'update', oldImage: image, newImage: updatedImage }]);
                return updatedImage;
            }
            return image;
        }));
    };

    const toggleControls = (id) => {
        setImages(images.map(image => {
            if (image.id === id) {
                return { ...image, showControls: !image.showControls };
            }
            return image;
        }));
    };

   const deleteImage = (imageId) => {
        setImages((prevImages) => prevImages.filter((image) => image.id !== imageId));
        markImageForDeletion(imageId);
    };

    const copyImage = (id) => {
        const imageToCopy = images.find(image => image.id === id);
        if (imageToCopy) {
            const newImage = { ...imageToCopy, id: Date.now(), x: imageToCopy.x + 10, y: imageToCopy.y + 10, showControls: false };
            setImages([...images, newImage]);
            setUndoStack([...undoStack, { type: 'add', image: newImage }]);
        }
    };

    const copyImageToClipboard = (id) => {
        const imageToCopy = images.find(image => image.id === id);
        if (imageToCopy) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = imageToCopy.img.width;
            canvas.height = imageToCopy.img.height;
            ctx.drawImage(imageToCopy.img, 0, 0);
            canvas.toBlob(blob => {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    console.log('Image copied to clipboard');
                }).catch(err => {
                    console.error('Failed to copy image to clipboard', err);
                });
            });
        } else {
            console.error('Image not found');
        }
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;
        const lastAction = undoStack.pop();
        setRedoStack([...redoStack, lastAction]);

        switch (lastAction.type) {
            case 'add':
                setImages(images.filter(image => image.id !== lastAction.image.id));
                break;
            case 'delete':
                setImages([...images, lastAction.image]);
                break;
            case 'update':
                setImages(images.map(image => image.id === lastAction.newImage.id ? lastAction.oldImage : image));
                break;
            default:
                break;
        }
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const lastAction = redoStack.pop();
        setUndoStack([...undoStack, lastAction]);

        switch (lastAction.type) {
            case 'add':
                setImages([...images, lastAction.image]);
                break;
            case 'delete':
                setImages(images.filter(image => image.id !== lastAction.image.id));
                break;
            case 'update':
                setImages(images.map(image => image.id === lastAction.oldImage.id ? lastAction.newImage : image));
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'z') {
                handleUndo();
            }
            if (e.ctrlKey && e.key === 'y') {
                handleRedo();
            }
            if (e.ctrlKey && e.key === 'c') {
                copyImageToClipboard(selectedImageId);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('paste', handlePaste);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('paste', handlePaste);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [mousePosition, undoStack, redoStack, selectedImageId]);

    useEffect(() => {
        const handleUnload = () => {
            if (imagesToDelete.length > 0) {
                navigator.sendBeacon('http://localhost:3001/images/delete', JSON.stringify({ images: imagesToDelete }));
            }
        };
    
        window.addEventListener('unload', handleUnload);
    
        return () => {
            window.removeEventListener('unload', handleUnload);
        };
    }, [imagesToDelete]);
    

    const handleFabClick = () => {
        document.getElementById('fileInput').click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFile(file, mousePosition.x, mousePosition.y);
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
                toggleControls={toggleControls}
                copyImage={copyImage}
                deleteImage={deleteImage}
                setUndoStack={setUndoStack}
                setRedoStack={setRedoStack}
                undoStack={undoStack}
                redoStack={redoStack}
                setImages={setImages}
                copyImageToClipboard={copyImageToClipboard}
                selectedImageId={selectedImageId}
                setSelectedImageId={setSelectedImageId}
            />
            {images.map((image) => (
                <ImageTag key={image.id} image={image} addTag={addTag} />
            ))}
            <Fab onClick={handleFabClick} />

            {selectedImageId && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}>
                    <button onClick={() => copyImageToClipboard(selectedImageId)}>Copy</button>
                    <button onClick={() => deleteImage(selectedImageId)}>Delete</button>
                </div>
            )}
        </div>
    );
}

export default App;


