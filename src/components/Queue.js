import React from 'react';

const Queue = ({ queue, currentSong, onSongClick, onClose }) => {
  return (
    <div className="queue-container">
      <div className="queue-header">
        <h3>Queue ({queue.length} songs)</h3>
        <button onClick={onClose} className="queue-close">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="queue-songs">
        {queue.length === 0 ? (
          <div className="queue-empty">
            <p>Your queue is empty</p>
          </div>
        ) : (
          queue.map((song, index) => (
            <div 
              key={`${song.id}-${index}`}
              className={`queue-song ${currentSong?.id === song.id ? 'playing' : ''}`}
              onClick={() => onSongClick(song)}
            >
              <img src={song.cover} alt={song.title} className="queue-song-thumb" />
              <div className="queue-song-info">
                <div className="queue-song-title">{song.title}</div>
                <div className="queue-song-artist">{song.artist}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Queue;