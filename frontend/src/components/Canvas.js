import React, { useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group, Text } from 'react-konva';

const Canvas = ({ images, onDrop, onDragOver, toggleControls, copyImage, copyImageToClipboard, deleteImage, setUndoStack, setRedoStack, undoStack, redoStack, setImages, selectedImageId, setSelectedImageId }) => {
    const stageRef = useRef(null);

    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;

        if (e.evt.ctrlKey || e.evt.metaKey) {
            const scaleBy = 1.05;
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
            stage.scale({ x: newScale, y: newScale });

            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };
            stage.position(newPos);
        } else {
            const panSpeed = 1.5;
            const newPos = {
                x: stage.x() - e.evt.deltaX * panSpeed,
                y: stage.y() - e.evt.deltaY * panSpeed,
            };
            stage.position(newPos);
        }

        stage.batchDraw();
    };

    const handleDragEnd = (e, image) => {

        const stage = stageRef.current ; 
        stage.draggable(true) ;

        const newImages = images.map(img => {
            if (img.id === image.id) {
                return { ...img, x: e.target.x(), y: e.target.y() };
            }
            return img;
        });
        setUndoStack([...undoStack, { type: 'update', oldImage: image, newImage: { ...image, x: e.target.x(), y: e.target.y() } }]);
        setRedoStack([]);
        setImages(newImages);
    };

    const handleDoubleClick = (id) => {
        setSelectedImageId(id);
    };

    const handleDragStart = (e) => {
        const stage = stageRef.current;
        stage.draggable(false);
    };


    return (
        <div
            style={{ width: '100vw', height: '100vh' }}
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
        <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            draggable={!selectedImageId}  // Make the stage undraggable when an image is selected
            onWheel={handleWheel}
            ref={stageRef}
        >
            <Layer>
                {images.map((image) => (
                    <Group key={image.id} onDblClick={() => handleDoubleClick(image.id)}>
                        <KonvaImage
                            image={image.img}
                            x={image.x}
                            y={image.y}
                            draggable
                            onDragEnd={(e) => handleDragEnd(e, image)}
                        />
                        {selectedImageId === image.id && (
                            <>
                                <Rect
                                    x={image.x}
                                    y={image.y}
                                    width={image.img.width}
                                    height={image.img.height}
                                    stroke="blue"
                                    strokeWidth={2}
                                />
                                <Group x={image.x} y={image.y - 30}>
                                    <Rect width={100} height={30} fill="white" stroke="gray" strokeWidth={1} />
                                    <Text
                                        text="Copy"
                                        x={5}
                                        y={5}
                                        onClick={() => copyImageToClipboard(image.id)}
                                    />
                                    <Text
                                        text="Delete"
                                        x={55}
                                        y={5}
                                        onClick={() => deleteImage(image.id)}
                                    />
                                </Group>
                            </>
                        )}
                    </Group>
                ))}
            </Layer>
        </Stage>
            
        </div>
    );
};

export default Canvas;


// import React, { useRef, useState } from 'react';
// import { Stage, Layer, Image as KonvaImage, Rect, Group, Text } from 'react-konva';
// const Canvas = ({ images, onDrop, onDragOver, toggleControls, copyImage,copyImageToClipboard, deleteImage, setUndoStack, setRedoStack, undoStack, redoStack, setImages }) => {
//     const stageRef = useRef(null);
//     const [selectedImageId, setSelectedImageId] = useState(null);

//     const handleWheel = (e) => {
//         e.evt.preventDefault();
//         const stage = stageRef.current;

//         if (e.evt.ctrlKey || e.evt.metaKey) {
//             const scaleBy = 1.05;
//             const oldScale = stage.scaleX();
//             const pointer = stage.getPointerPosition();

//             const mousePointTo = {
//                 x: (pointer.x - stage.x()) / oldScale,
//                 y: (pointer.y - stage.y()) / oldScale,
//             };

//             const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
//             stage.scale({ x: newScale, y: newScale });

//             const newPos = {
//                 x: pointer.x - mousePointTo.x * newScale,
//                 y: pointer.y - mousePointTo.y * newScale,
//             };
//             stage.position(newPos);
//         } else {
//             const panSpeed = 1.5;
//             const newPos = {
//                 x: stage.x() - e.evt.deltaX * panSpeed,
//                 y: stage.y() - e.evt.deltaY * panSpeed,
//             };
//             stage.position(newPos);
//         }

//         stage.batchDraw();
//     };

//     const handleDragEnd = (e, image) => {
//         const newImages = images.map(img => {
//             if (img.id === image.id) {
//                 return { ...img, x: e.target.x(), y: e.target.y() };
//             }
//             return img;
//         });
//         setUndoStack([...undoStack, { type: 'update', oldImage: image, newImage: { ...image, x: e.target.x(), y: e.target.y() } }]);
//         setRedoStack([]);
//         setImages(newImages);
//     };

//     const handleDoubleClick = (id) => {
//         setSelectedImageId(id);
//     };

//     return (
//         <div
//             style={{ width: '100vw', height: '100vh' }}
//             onDrop={onDrop}
//             onDragOver={onDragOver}
//         >
//             <Stage
//                 width={window.innerWidth}
//                 height={window.innerHeight}
//                 draggable
//                 onWheel={handleWheel}
//                 ref={stageRef}
//             >
//                 <Layer>
//                     {images.map((image) => (
//                         <Group key={image.id} onDblClick={() => handleDoubleClick(image.id)}>
//                             <KonvaImage
//                                 image={image.img}
//                                 x={image.x}
//                                 y={image.y}
//                                 draggable
//                                 onDragEnd={(e) => handleDragEnd(e, image)}
//                             />
//                             {selectedImageId === image.id && (
//                                 <>
//                                     <Rect
//                                         x={image.x}
//                                         y={image.y}
//                                         width={image.img.width}
//                                         height={image.img.height}
//                                         stroke="blue"
//                                         strokeWidth={2}
//                                     />
//                                     <Group x={image.x} y={image.y - 30}>
//                                         <Rect width={100} height={30} fill="white" stroke="gray" strokeWidth={1} />
//                                         <Text
//                                             text="Copy"
//                                             x={5}
//                                             y={5}
//                                             onClick={() => copyImageToClipboard(image.id)}
//                                         />
//                                         <Text
//                                             text="Delete"
//                                             x={55}
//                                             y={5}
//                                             onClick={() => deleteImage(image.id)}
//                                         />
//                                     </Group>
//                                 </>
//                             )}
//                         </Group>
//                     ))}
//                 </Layer>
//             </Stage>
//         </div>
//     );
// };

// export default Canvas;

