import { useEffect, useRef } from "react";

export function Video({ stream, muted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay     // This is crucial for both video and audio
      playsInline  // Important for mobile browsers
      muted={muted}
      style={{ width: "100%", borderRadius: "8px" }}
    />
  );
}