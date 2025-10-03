import React, { useState, useEffect, useRef } from 'react';
import './App.css';

export default function SongGuessingGame() {
  const [gameState, setGameState] = useState('setup');
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const totalRounds = 10;

  
  const fetchSongs = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=50`
      );
      const data = await response.json();
      
      
      const validSongs = data.results.filter(song => song.previewUrl);
      
      if (validSongs.length < 3) {
        alert('Not enough songs found. Try a different search term!');
        setLoading(false);
        return;
      }
      
      setSongs(validSongs);
      setLoading(false);
      startGame(validSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
      alert('Failed to fetch songs. Please try again!');
      setLoading(false);
    }
  };

  
  const startGame = (songList) => {
    setGameState('playing');
    setScore(0);
    setRound(1);
    loadNewRound(songList, 1);
  };

  
  const loadNewRound = (songList, currentRound) => {
    if (currentRound > totalRounds) {
      setGameState('gameOver');
      return;
    }

    
    const correctSong = songList[Math.floor(Math.random() * songList.length)];
    
    
    const wrongSongs = songList
      .filter(song => song.trackId !== correctSong.trackId)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    
    const allOptions = [correctSong, ...wrongSongs]
      .sort(() => 0.5 - Math.random())
      .map(song => ({
        trackId: song.trackId,
        trackName: song.trackName,
        artistName: song.artistName
      }));

    setCurrentSong(correctSong);
    setOptions(allOptions);
    setGameState('playing');

    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = correctSong.previewUrl;
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
    }, 100);
  };

  
  const handleAnswer = (selectedTrackId) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (selectedTrackId === currentSong.trackId) {
      setScore(score + 1);
      setGameState('correct');
    } else {
      setGameState('wrong');
    }
  };

  
  const nextRound = () => {
    const nextRoundNum = round + 1;
    setRound(nextRoundNum);
    loadNewRound(songs, nextRoundNum);
  };

  
  const restartGame = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setGameState('setup');
    setSongs([]);
    setCurrentSong(null);
    setOptions([]);
    setScore(0);
    setRound(1);
    setSearchQuery('');
  };

  return (
    <div className="container">
      <div className="game-card">
        <h1 className="title">🎵 Song Guessing Game</h1>

        {/* Setup Screen */}
        {gameState === 'setup' && (
          <div className="setup-container">
            <p className="instructions">
              Enter an artist name or genre to start the game!
            </p>
            <input
              type="text"
              placeholder="e.g., Taylor Swift, Rock, Pop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && searchQuery && fetchSongs(searchQuery)}
              className="input"
            />
            <button
              onClick={() => fetchSongs(searchQuery)}
              disabled={loading || !searchQuery}
              className="button primary-button"
            >
              {loading ? 'Loading...' : 'Start Game'}
            </button>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <div className="playing-container">
            <div className="score-bar">
              <span>Round: {round}/{totalRounds}</span>
              <span>Score: {score}</span>
            </div>
            
            <div className="question-box">
              <h2 className="question">🎧 Listen and guess the song!</h2>
              <audio ref={audioRef} />
            </div>

            <div className="options-container">
              {options.map((option) => (
                <button
                  key={option.trackId}
                  onClick={() => handleAnswer(option.trackId)}
                  className="option-button"
                >
                  <div className="option-text">
                    <strong>{option.trackName}</strong>
                    <span className="artist-text">{option.artistName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Correct Answer Screen */}
        {gameState === 'correct' && (
          <div className="result-container">
            <div className="result-box correct-box">
              <h2 className="result-title">✅ Correct!</h2>
              <p className="result-text">
                <strong>{currentSong.trackName}</strong>
                <br />
                by {currentSong.artistName}
              </p>
              <button
                onClick={nextRound}
                className="button primary-button"
              >
                {round < totalRounds ? 'Next Round' : 'See Results'}
              </button>
            </div>
          </div>
        )}

        {/* Wrong Answer Screen */}
        {gameState === 'wrong' && (
          <div className="result-container">
            <div className="result-box wrong-box">
              <h2 className="result-title">❌ Wrong!</h2>
              <p className="result-text">
                The correct answer was:
                <br />
                <strong>{currentSong.trackName}</strong>
                <br />
                by {currentSong.artistName}
              </p>
              <button
                onClick={nextRound}
                className="button primary-button"
              >
                {round < totalRounds ? 'Next Round' : 'See Results'}
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="result-container">
            <div className="game-over-box">
              <h2 className="game-over-title">🎉 Game Over!</h2>
              <p className="final-score">
                Final Score: {score}/{totalRounds}
              </p>
              <p className="score-message">
                {score === totalRounds && "Perfect score! You're a music master! 🌟"}
                {score >= 3 && score < totalRounds && "Great job! You know your music! 🎵"}
                {score < 3 && "Keep practicing! Music is fun! 🎶"}
              </p>
              <button
                onClick={restartGame}
                className="button primary-button"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}