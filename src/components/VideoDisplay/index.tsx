import React from 'react';
import './styles.css';

interface VideoDisplayProps {
  isJoined: boolean;
  avatarVideoUrl: string;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ isJoined, avatarVideoUrl }) => {
  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <div className="video-container">
      {isImageUrl(avatarVideoUrl) ? (
        <img
          id="placeholder-image"
          hidden={isJoined}
          src={avatarVideoUrl}
          alt="Avatar placeholder"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      ) : (
        <video 
          id="placeholder-video" 
          hidden={isJoined} 
          src={avatarVideoUrl} 
          loop 
          muted 
          playsInline 
          autoPlay
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto'
          }}
        />
      )}
      <video 
        id="remote-video"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default VideoDisplay;
