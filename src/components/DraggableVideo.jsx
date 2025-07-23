import { useState } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { Video } from './Video'; // Your existing Video component
import { Paper, Box } from '@mui/material';

export function DraggableVideo({ stream, muted = false, defaultPosition, defaultSize }) {
    const [size, setSize] = useState(defaultSize || { width: 400, height: 300 });

    return (
        <Draggable
            handle=".drag-handle" // Specifies that dragging is initiated from the element with this class
            defaultPosition={defaultPosition}
            bounds="parent" // Restricts dragging to the parent container
        >
            <ResizableBox
                width={size.width}
                height={size.height}
                onResize={(e, { size }) => setSize(size)}
                minConstraints={[200, 150]} // Minimum size
                maxConstraints={[1200, 900]} // Maximum size
                style={{ position: 'absolute' }} // Important for positioning
            >
                <Paper elevation={4} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Create a draggable handle bar at the top */}
                    <Box
                        className="drag-handle"
                        sx={{
                            width: '100%',
                            padding: '4px',
                            backgroundColor: 'primary.main',
                            color: 'white',
                            textAlign: 'center',
                            cursor: 'move',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px'
                        }}
                    >
                        {muted ? "Your Video" : "Remote Video"}
                    </Box>
                    <Video stream={stream} muted={muted} />
                </Paper>
            </ResizableBox>
        </Draggable>
    );
}