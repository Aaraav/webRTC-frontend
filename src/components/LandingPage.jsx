import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This component simulates a landing page for joining a meeting.
// In a real application, you would integrate this with a routing library
// like React Router to handle navigation.
export function LandingPage() {
    const navigate=useNavigate();
  const [meetingId, setMeetingId] = useState('');
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // In a real app with React Router, you would use this.
  // const navigate = useNavigate();

  // Effect to clear the notification after a few seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingId.trim()) {
      // Placeholder for navigation logic
      setNotification({ message: `Joining meeting: ${meetingId}`, type: 'success' });
      navigate(`/meeting/${meetingId}`);
    } else {
      setNotification({ message: 'Please provide a Meeting ID.', type: 'error' });
    }
  };

  // --- STYLES ---
  // We are defining styles as JavaScript objects for inline styling.

  const pageStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    // A vibrant gradient background for a modern look.
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '20px',
    boxSizing: 'border-box',
    overflow: 'hidden', // Prevents scrollbars from the background animation if one were added
  };

  const cardStyle = {
    // "Glassmorphism" effect
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', // For Safari support
    
    padding: 'clamp(30px, 5vw, 50px)', // Responsive padding
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '480px',
    transition: 'transform 0.3s ease',
  };

  const headerStyle = {
    fontSize: 'clamp(2rem, 6vw, 2.8rem)', // Responsive font size
    fontWeight: '700',
    color: 'white',
    marginBottom: '12px',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const paragraphStyle = {
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '40px',
    fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  };

  const inputContainerStyle = {
    position: 'relative',
    width: '100%',
    marginBottom: '20px',
  };

  const inputStyle = {
    padding: '18px 20px 18px 50px', // Left padding for icon
    fontSize: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${isInputFocused ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)'}`,
    borderRadius: '12px',
    width: '100%',
    boxSizing: 'border-box',
    color: 'white',
    transition: 'border-color 0.3s ease, background-color 0.3s ease',
    outline: 'none',
  };
  
  // Style for the placeholder text
  const placeholderStyle = `
    input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    input::-webkit-input-placeholder { /* Chrome/Opera/Safari */
      color: rgba(255, 255, 255, 0.6);
    }
    input::-moz-placeholder { /* Firefox 19+ */
      color: rgba(255, 255, 255, 0.6);
    }
    input:-ms-input-placeholder { /* IE 10+ */
      color: rgba(255, 255, 255, 0.6);
    }
    input:-moz-placeholder { /* Firefox 18- */
      color: rgba(255, 255, 255, 0.6);
    }
  `;

  const inputIconStyle = {
    position: 'absolute',
    top: '50%',
    left: '18px',
    transform: 'translateY(-50%)',
    color: 'rgba(255, 255, 255, 0.8)',
    pointerEvents: 'none',
  };

  const buttonStyle = {
    padding: '18px 24px',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4c51bf',
    // A subtle gradient on the button for a premium feel
    background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(239,246,255,1) 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: isButtonHovered ? '0 8px 20px rgba(0, 0, 0, 0.2)' : '0 4px 10px rgba(0, 0, 0, 0.1)',
    transform: isButtonHovered ? 'translateY(-3px)' : 'translateY(0)',
  };
  
  const notificationStyle = {
    marginTop: '20px',
    padding: '10px 15px',
    borderRadius: '8px',
    color: 'white',
    backgroundColor: notification.type === 'error' ? 'rgba(229, 62, 62, 0.7)' : 'rgba(56, 161, 105, 0.7)',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'opacity 0.5s ease',
    opacity: notification.message ? 1 : 0,
    minHeight: '1.2rem', // Prevents layout shift
  };

  return (
    <div style={pageStyle}>
      {/* We inject a style tag to handle placeholder styling, which can't be done with inline styles */}
      <style>{placeholderStyle}</style>
      <div style={cardStyle}>
        <h1 style={headerStyle}>Ready to Connect?</h1>
        <p style={paragraphStyle}>Enter your Meeting ID to join the conversation instantly.</p>
        <form onSubmit={handleJoinMeeting} style={formStyle}>
          <div style={inputContainerStyle}>
            {/* SVG icon for the input field */}
            <svg style={inputIconStyle} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <input
              style={inputStyle}
              type="text"
              placeholder="Enter Meeting ID"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
          </div>
          <button
            style={buttonStyle}
            type="submit"
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            Join Meeting
          </button>
        </form>
        <div style={notificationStyle}>
          {notification.message}
        </div>
      </div>
    </div>
  );
}
