import { useState, useRef, useEffect } from 'react';
import './App.css';

const FolderIcon = ({ onClick }) => (
  <div onClick={onClick} style={{ cursor: 'pointer' }}>
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
  </div>
);


const musicList = [
  {
    id: 1,
    title: 'Alessia Cara - Scars To Your Beautiful',
    artist: 'Alessia Cara',
    src: '/music/Alessia Cara - Scars To Your Beautiful (Official Audio).mp3',
    duration: 234
  },
  {
    id: 2,
    title: 'love rehab',
    artist: 'issac frank ft mae hill',
    src: '/music/Issac Frank - Love Rehab (Dun Dun) ft. Mae Hill.mp3',
    duration: 234
  },
   {
    id: 2,
    title: 'your idol',
    artist: 'Saja boys(kpop demond hunters)',
    src: 'music/Your Idol _ Official Song Clip _ KPop Demon Hunters _ Sony Animation.mp3',
    duration: 234
  },
   {
    id: 2,
    title: 'constellation',
    artist: 'Jade LeMac',
    src: 'music/Jade LeMac - Constellations (Sped Up).mp3',
    duration: 234
  }


];

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [localSongs, setLocalSongs] = useState([]);
  const fileInputRef = useRef(null);
  const audioRef = useRef(new Audio(musicList[0].src));
  const progressBarRef = useRef(null);
  const isSeeking = useRef(false);

  const allSongs = [...musicList, ...localSongs];
  const currentTrack = allSongs[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => {
      if (!isSeeking.current) {
        setCurrentTime(audio.currentTime);
      }
    };
    const updateDuration = () => {
      setDuration(audio.duration || musicList[currentTrackIndex].duration);
    };
    const handleEnded = () => {
      if (currentTrackIndex < musicList.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.src = currentTrack.src;
    setDuration(currentTrack.duration);
    
    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Error playing new track:', error);
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSeek = (e) => {
    const progressBar = progressBarRef.current;
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleSeekStart = () => {
    isSeeking.current = true;
  };

  const handleSeekEnd = () => {
    isSeeking.current = false;
  };

  const handlePrevious = () => {
    setCurrentTrackIndex(prev => (prev > 0 ? prev - 1 : musicList.length - 1));
  };

  const handleNext = () => {
    setCurrentTrackIndex(prev => (prev < musicList.length - 1 ? prev + 1 : 0));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
      if (!file.type.startsWith('audio/')) return;
      
      const url = URL.createObjectURL(file);
      const newSong = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local File',
        src: url,
        duration: 0,
        isLocal: true
      };
      
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        newSong.duration = audio.duration;
        setLocalSongs(prev => [...prev, newSong]);
      };
    });
  };

  const handleFolderClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    return () => {
      localSongs.forEach(song => {
        if (song.isLocal) {
          URL.revokeObjectURL(song.src);
        }
      });
    };
  }, [localSongs]);

  return (
    <div className="app">
      <header><h1>🎧 </h1></header>
      <main>
        <div className="play-button-container">
          <img 
            src="\src\assets\Images\image.png"
            alt="Music Player Logo" 
            className="music-logo"
            style={{ width: '200px', height: '300x' }}
          />
        </div>
        <div className="song-info">
          <h2>{currentTrack.title}</h2>
          <p>{currentTrack.artist}</p>
        </div>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            ref={progressBarRef}
            onClick={handleSeek}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onMouseLeave={handleSeekEnd}
          >
            <div 
              className="progress" 
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            ></div>
            <div 
              className="progress-knob"
              style={{ left: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            ></div>
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="playback-controls">
          <button 
            className="control-button" 
            aria-label="Previous"
            onClick={handlePrevious}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6l-8.5 6z"/>
            </svg>
          </button>
          <button className="control-button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button 
            className="control-button" 
            aria-label="Next"
            onClick={handleNext}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="audio/*" 
          multiple 
          onChange={handleFileChange}
        />
        <div className="search-container-wrapper">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
            <span className="search-icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </span>
            <button 
              className="folder-button" 
              onClick={handleFolderClick}
              aria-label="Add Local Songs"
              title="Add Local Songs"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="up-next">
          <div className="up-next-header" onClick={togglePlaylist}>
            <svg 
              className={`dropdown-arrow ${showPlaylist ? 'open' : ''}`} 
              viewBox="0 0 24 24" 
              width="20" 
              height="20"
            >
              <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
            <h3>UP NEXT</h3>
          </div>
          {showPlaylist && (
            <div className="playlist-dropdown">
              {allSongs.map((track, index) => (
                <div 
                  key={track.id}
                  className={`playlist-item ${index === currentTrackIndex ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentTrackIndex(index);
                    setIsPlaying(true);
                  }}
                >
                  <div className="playlist-item-info">
                    <div className="playlist-item-title">{track.title}</div>
                    <div className="playlist-item-artist">{track.artist}</div>
                  </div>
                  {index === currentTrackIndex && (
                    <div className="now-playing">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--primary-color)">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;