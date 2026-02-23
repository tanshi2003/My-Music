import React from 'react';

const Queue = ({ queue, currentSong, onSongClick, onClose }) => {
  const handleSongClick = (song) => {
    if (onSongClick && typeof onSongClick === 'function') {
      onSongClick(song);
    }
  };

  return (
    <div className="queue-container">
      <div className="queue-header">
        <h3>Queue ({queue.length} songs)</h3>
        <button onClick={onClose} className="queue-close" title="Close queue">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="queue-songs">
        {queue.length === 0 ? (
          <div className="queue-empty">
            <p>Your queue is empty</p>
            <p style={{ fontSize: '12px', opacity: 0.6 }}>Add songs to queue to see them here</p>
          </div>
        ) : (
          queue.map((song, index) => (
            <div 
              key={`${song.id}-${index}`}
              className={`queue-song ${currentSong?.id === song.id ? 'playing' : ''}`}
              onClick={() => handleSongClick(song)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSongClick(song);
                }
              }}
            >
              <img src={song.cover} alt={song.title} className="queue-song-thumb" />
              <div className="queue-song-info">
                <div className="queue-song-title">{song.title}</div>
                <div className="queue-song-artist">{song.artist}</div>
              </div>
              {currentSong?.id === song.id && (
                <span className="queue-now-playing" title="Now playing">▶</span>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .queue-container {
          position: fixed;
          right: 18px;
          bottom: 120px;
          width: 340px;
          max-height: 500px;
          background: rgba(20,20,30,0.95);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          z-index: 70;
          box-shadow: 0 12px 40px rgba(2,6,35,0.45);
        }
        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          color: #fff;
        }
        .queue-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .queue-close {
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .queue-close:hover {
          background: rgba(255,255,255,0.08);
        }
        .queue-songs {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .queue-empty {
          padding: 32px 16px;
          text-align: center;
          color: rgba(255,255,255,0.6);
        }
        .queue-empty p {
          margin: 8px 0;
        }
        .queue-song {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          margin-bottom: 6px;
          border-radius: 8px;
          background: rgba(255,255,255,0.02);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .queue-song:hover {
          background: rgba(255,255,255,0.06);
          transform: translateX(4px);
        }
        .queue-song.playing {
          background: rgba(255,107,154,0.12);
          border: 1px solid rgba(255,107,154,0.2);
        }
        .queue-song-thumb {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
        }
        .queue-song-info {
          flex: 1;
          min-width: 0;
        }
        .queue-song-title {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .queue-song-artist {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .queue-now-playing {
          font-size: 12px;
          color: #ff6b9a;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Queue;