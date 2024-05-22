import React, { useRef } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';

const Canvas = ({ images, onDrop, onDragOver }) => {
    const stageRef = useRef(null);

    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
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
        stage.batchDraw();
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
                draggable
                onWheel={handleWheel}
                ref={stageRef}
            >
                <Layer>
                    {images.map((image) => (
                        <KonvaImage
                            key={image.id}
                            image={image.img}
                            x={image.x}
                            y={image.y}
                            draggable
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};

export default Canvas;
