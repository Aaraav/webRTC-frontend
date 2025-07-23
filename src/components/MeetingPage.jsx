import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socketIO from 'socket.io-client';
import { Button, Typography, IconButton, TextField, Box, Paper, List, ListItem, ListItemText, Divider } from "@mui/material";
import { CentralizedCard } from "./CentralizedCard";
import { Video } from "./Video";
import { DraggableVideo } from "./DraggableVideo";
import toast, { Toaster } from 'react-hot-toast';

// Import all necessary icons
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import SendIcon from '@mui/icons-material/Send';

export function MeetingPage() {
    const pcRef = useRef(new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    }));

    const [socket, setSocket] = useState(null);
    const [meetingJoined, setMeetingJoined] = useState(false);
    const [videoStream, setVideoStream] = useState(null);
    const [remoteVideoStream, setRemoteVideoStream] = useState(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenShareStreamRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const chatEndRef = useRef(null);

    const params = useParams();
    const navigate = useNavigate();
    const roomId = params.roomId;

    const toggleMute = () => {
        if (!videoStream) return;
        videoStream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        });
    };

    const toggleCamera = () => {
        if (!videoStream) return;
        videoStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsCameraOff(!track.enabled);
        });
    };

    const toggleScreenShare = async () => {
        const pc = pcRef.current;
        const videoSender = pc.getSenders().find(sender => sender.track?.kind === 'video');
        if (!videoSender) return;

        if (isScreenSharing) {
            screenShareStreamRef.current?.getTracks().forEach(track => track.stop());
            const cameraTrack = videoStream.getVideoTracks()[0];
            await videoSender.replaceTrack(cameraTrack);
            setIsScreenSharing(false);
        } else {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];
                screenTrack.onended = () => {
                    const cameraTrack = videoStream.getVideoTracks()[0];
                    videoSender.replaceTrack(cameraTrack);
                    setIsScreenSharing(false);
                };
                await videoSender.replaceTrack(screenTrack);
                screenShareStreamRef.current = screenStream;
                setIsScreenSharing(true);
            } catch (err) {
                console.error("Screen share error:", err);
            }
        }
    };
    
    const leaveMeeting = () => {
        videoStream?.getTracks().forEach(track => track.stop());
        screenShareStreamRef.current?.getTracks().forEach(track => track.stop());
        pcRef.current.close();
        socket?.disconnect();
        navigate('/');
    };
    
    const handleSendMessage = () => {
        if (newMessage.trim() && socket) {
            const messageData = { text: newMessage, roomId: roomId, author: 'Me' };
            socket.emit('chat-message', messageData);
            setMessages((prev) => [...prev, messageData]);
            setNewMessage("");
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        const pc = pcRef.current;
        const s = socketIO.connect("https://webrtc-q4yt.onrender.com");
        setSocket(s);

        const setup = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setVideoStream(stream);
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            } catch (error) {
                console.error("Error accessing media devices.", error);
                toast.error("Could not access camera or microphone.");
            }
        };
        setup();

        const remoteStream = new MediaStream();
        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
            setRemoteVideoStream(remoteStream);
        };
        
        pc.onicecandidate = ({ candidate }) => {
            if (candidate) s.emit("iceCandidateReply", { candidate, roomId });
        };

        s.on("connect", () => {
             s.emit("join", { roomId });
        });

        s.on("localDescription", async ({ description }) => {
            await pc.setRemoteDescription(description);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            s.emit("remoteDescription", { description: pc.localDescription, roomId });
        });

        s.on("remoteDescription", async ({ description }) => {
            await pc.setRemoteDescription(description);
        });

        s.on("iceCandidate", ({ candidate }) => {
            if (candidate) pc.addIceCandidate(candidate);
        });

        s.on("iceCandidateReply", ({ candidate }) => {
            if (candidate) pc.addIceCandidate(candidate);
        });

        s.on('chat-message', (messageData) => {
            setMessages((prev) => [...prev, { ...messageData, author: 'Peer' }]);
        });

        s.on("peer-left", () => {
            toast.error("The other user has left the meeting.");
            setRemoteVideoStream(null);
        });

        return () => {
            s.disconnect();
            pc.close();
            videoStream?.getTracks().forEach(track => track.stop());
            screenShareStreamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, [roomId]);

    if (!videoStream) {
        return <CentralizedCard><Typography>Loading devices...</Typography></CentralizedCard>;
    }

    if (!meetingJoined) {
        return (
            <CentralizedCard>
                <Typography textAlign={"center"} variant="h5">Ready to join meeting {roomId}?</Typography>
                <br />
                <div style={{ width: '300px', margin: '0 auto', borderRadius: '8px', overflow: 'hidden' }}>
                    <Video stream={videoStream} muted />
                </div>
                <br />
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                        onClick={async () => {
                            try {
                                const offer = await pcRef.current.createOffer();
                                await pcRef.current.setLocalDescription(offer);
                                socket.emit("localDescription", { description: pcRef.current.localDescription, roomId });
                                setMeetingJoined(true);
                            } catch (err) {
                                console.error("Offer Error:", err);
                            }
                        }}
                        disabled={!socket}
                        variant="contained"
                    >
                        Join meeting
                    </Button>
                </div>
            </CentralizedCard>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f0f2f5', flexDirection: 'column' }}>
            <Toaster position="top-center" />
            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Box sx={{ flexGrow: 1, position: 'relative', p: 2 }}>
                    <DraggableVideo stream={videoStream} muted defaultPosition={{ x: 20, y: 20 }} />
                    {remoteVideoStream && <DraggableVideo stream={remoteVideoStream} defaultPosition={{ x: 450, y: 20 }} />}
                </Box>
                <Paper elevation={3} sx={{ width: 350, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #ddd' }}>
                    <Typography variant="h6" p={2}>Chat</Typography>
                    <Divider />
                    <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                        {messages.map((msg, index) => (
                            <ListItem key={index} sx={{ textAlign: msg.author === 'Me' ? 'right' : 'left' }}>
                                <ListItemText 
                                    primary={msg.text} 
                                    secondary={msg.author} 
                                    primaryTypographyProps={{ 
                                        sx: { 
                                            bgcolor: msg.author === 'Me' ? 'primary.main' : 'grey.300', 
                                            color: msg.author === 'Me' ? 'primary.contrastText' : 'inherit',
                                            borderRadius: '10px',
                                            p: '6px 12px',
                                            display: 'inline-block'
                                        } 
                                    }}
                                />
                            </ListItem>
                        ))}
                        <div ref={chatEndRef} />
                    </List>
                    <Divider />
                    <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                        <TextField fullWidth size="small" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                        <IconButton color="primary" onClick={handleSendMessage}><SendIcon /></IconButton>
                    </Box>
                </Paper>
            </Box>
            {/* [FIXED] Control bar with correct conditional icons */}
            <Paper elevation={4} sx={{ p: 1, display: 'flex', justifyContent: 'center', gap: 2, borderTop: '1px solid #ddd', backgroundColor: '#ffffff' }}>
                <IconButton onClick={toggleMute} color="primary">
                    {isMuted ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
                <IconButton onClick={toggleCamera} color="primary">
                    {isCameraOff ? <VideocamOffIcon /> : <VideocamIcon />}
                </IconButton>
                <IconButton onClick={toggleScreenShare} color="primary">
                    {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>
                <IconButton onClick={leaveMeeting} sx={{ color: 'red' }}>
                    <CallEndIcon />
                </IconButton>
            </Paper>
        </Box>
    );
}