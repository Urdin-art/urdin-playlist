import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/types';
import { useAppConfig } from './useAppConfig';

export const useMusicPlayer = () => {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [activeSongs, setActiveSongs] = useState<Song[]>([]);
  const [excludedSongs, setExcludedSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [personalPlaylist, setPersonalPlaylist] = useState<string[]>([]);

  const { config, songId, isLoading: configLoading } = useAppConfig();

  const loadSongs = useCallback(async () => {
    if (!config) return;
    
    try {
      setIsLoading(true);
      const allSongsResponse = await fetch('/songs-master.json?v=' + Date.now());
      if (!allSongsResponse.ok) {
        throw new Error('Error al cargar la lista maestra de canciones: ' + allSongsResponse.status);
      }
      const allSongsData: Omit<Song, 'isNew'>[] = await allSongsResponse.json();
      const playedSongs = JSON.parse(localStorage.getItem(`${config.storage}_playedSongs`) || '[]');
      const allSongsWithNewStatus = allSongsData.map(song => ({
        ...song,
        isNew: !playedSongs.includes(song.id)
      }));
      setAllSongs(allSongsWithNewStatus);

      let activeSongsArray: Song[] = [];
      let excludedSongsArray: Song[] = [];
      const excludedPlaylistOrder = JSON.parse(localStorage.getItem(`${config.storage}_excludedPlaylistOrder`) || '[]');

      if (songId) {
        // Cargar una sola canción si se proporciona un songId
        const singleSong = allSongsWithNewStatus.find(s => s.id === songId);
        if (singleSong) {
          activeSongsArray = [singleSong];
        } else {
          console.error(`La canción con ID "${songId}" no se encontró.`);
        }
      } else if (config.playlist === 'localstorage:personal_playlist') {
        // Lógica para la playlist personal
        const personalPlaylistOrder = JSON.parse(localStorage.getItem('personal_playlist') || '[]');
        const personalSongs = personalPlaylistOrder
          .map((id: string) => allSongsWithNewStatus.find(s => s.id === id))
          .filter((s?: Song): s is Song => !!s);

        personalSongs.forEach(song => {
          if (excludedPlaylistOrder.includes(song.id)) {
            excludedSongsArray.push(song);
          } else {
            activeSongsArray.push(song);
          }
        });
      } else if (config.playlist) {
        // Lógica para playlists normales
        const response = await fetch(config.playlist + '?v=' + Date.now());
        if (!response.ok) throw new Error('Error al cargar la playlist: ' + response.status);
        const songIdsInPlaylist: string[] = await response.json();
        
        const processedSongs: Song[] = songIdsInPlaylist
          .map(id => allSongsWithNewStatus.find(s => s.id === id))
          .filter((s?: Song): s is Song => !!s);
        
        const activePlaylistOrder = JSON.parse(localStorage.getItem(`${config.storage}_activePlaylistOrder`) || '[]');

        processedSongs.forEach(song => {
          if (excludedPlaylistOrder.includes(song.id)) {
            excludedSongsArray.push(song);
          } else {
            activeSongsArray.push(song);
          }
        });

        activeSongsArray.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          const aIndex = activePlaylistOrder.indexOf(a.id);
          const bIndex = activePlaylistOrder.indexOf(b.id);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      }

      excludedSongsArray.sort((a, b) => {
        const aIndex = excludedPlaylistOrder.indexOf(a.id);
        const bIndex = excludedPlaylistOrder.indexOf(b.id);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

      setActiveSongs(activeSongsArray);
      setExcludedSongs(excludedSongsArray);
      
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [config, songId]);

  useEffect(() => {
    loadSongs();
    const storedPlaylist = JSON.parse(localStorage.getItem('personal_playlist') || '[]');
    setPersonalPlaylist(storedPlaylist);
  }, [loadSongs]);

  const markSongAsPlayed = (songId: string) => {
    if (!config) return;
    const playedSongs = JSON.parse(localStorage.getItem(`${config.storage}_playedSongs`) || '[]');
    if (!playedSongs.includes(songId)) {
      playedSongs.push(songId);
      localStorage.setItem(`${config.storage}_playedSongs`, JSON.stringify(playedSongs));
      setActiveSongs(prev => prev.map(song => song.id === songId ? { ...song, isNew: false } : song));
    }
  };

  const toggleSongPlaylist = (songId: string) => {
    if (!config) return;
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;

    let newActiveSongs, newExcludedSongs;
    const isCurrentlyActive = activeSongs.some(s => s.id === songId);

    if (isCurrentlyActive) {
      newActiveSongs = activeSongs.filter(s => s.id !== songId);
      newExcludedSongs = [...excludedSongs, song];
      if (activeSongs[currentSongIndex]?.id === songId) {
        setCurrentSongIndex(Math.max(0, currentSongIndex - 1));
      }
    } else {
      newActiveSongs = [...activeSongs, song];
      newExcludedSongs = excludedSongs.filter(s => s.id !== songId);
    }

    localStorage.setItem(`${config.storage}_activePlaylistOrder`, JSON.stringify(newActiveSongs.map(s => s.id)));
    localStorage.setItem(`${config.storage}_excludedPlaylistOrder`, JSON.stringify(newExcludedSongs.map(s => s.id)));
    
    setActiveSongs(newActiveSongs);
    setExcludedSongs(newExcludedSongs);
  };

  const togglePersonalPlaylist = (songId: string) => {
    const updatedPlaylist = personalPlaylist.includes(songId)
      ? personalPlaylist.filter(id => id !== songId)
      : [...personalPlaylist, songId];
    
    setPersonalPlaylist(updatedPlaylist);
    localStorage.setItem('personal_playlist', JSON.stringify(updatedPlaylist));

    // Si estamos en la lista personal, la exclusión y la adición a favoritos es lo mismo
    if (config?.storage === 'my-side') {
      toggleSongPlaylist(songId);
    }
  };
  
  const moveSong = (direction: 'up' | 'down') => (songId: string) => {
    setActiveSongs(prev => {
      const index = prev.findIndex(s => s.id === songId);
      if ((direction === 'up' && index <= 0) || (direction === 'down' && index >= prev.length - 1)) {
        return prev;
      }
      
      const newArray = [...prev];
      const otherIndex = direction === 'up' ? index - 1 : index + 1;
      [newArray[index], newArray[otherIndex]] = [newArray[otherIndex], newArray[index]];
      
      const key = config?.playlist === 'localstorage:personal_playlist' ? 'personal_playlist' : `${config?.storage}_activePlaylistOrder`;
      localStorage.setItem(key, JSON.stringify(newArray.map(s => s.id)));

      if (currentSongIndex === index) {
        setCurrentSongIndex(otherIndex);
      } else if (currentSongIndex === otherIndex) {
        setCurrentSongIndex(index);
      }
      
      return newArray;
    });
  };

  const moveSongUp = moveSong('up');
  const moveSongDown = moveSong('down');

  const moveSongToStart = (songId: string) => {
    setActiveSongs(prev => {
      const index = prev.findIndex(s => s.id === songId);
      if (index <= 0) return prev;

      const newArray = [...prev];
      const [song] = newArray.splice(index, 1);
      newArray.unshift(song);

      const key = config?.playlist === 'localstorage:personal_playlist' ? 'personal_playlist' : `${config?.storage}_activePlaylistOrder`;
      localStorage.setItem(key, JSON.stringify(newArray.map(s => s.id)));
      
      // Actualizar el índice de la canción actual
      if (currentSongIndex === index) {
        setCurrentSongIndex(0);
      } else if (currentSongIndex < index) {
        setCurrentSongIndex(currentSongIndex + 1);
      }

      return newArray;
    });
  };

  const moveSongToEnd = (songId: string) => {
    setActiveSongs(prev => {
      const index = prev.findIndex(s => s.id === songId);
      if (index === -1 || index === prev.length - 1) return prev;

      const newArray = [...prev];
      const [song] = newArray.splice(index, 1);
      newArray.push(song);

      const key = config?.playlist === 'localstorage:personal_playlist' ? 'personal_playlist' : `${config?.storage}_activePlaylistOrder`;
      localStorage.setItem(key, JSON.stringify(newArray.map(s => s.id)));

      // Actualizar el índice de la canción actual
      if (currentSongIndex === index) {
        setCurrentSongIndex(newArray.length - 1);
      } else if (currentSongIndex > index) {
        setCurrentSongIndex(currentSongIndex - 1);
      }

      return newArray;
    });
  };

  const downloadSong = (songId: string) => {
    const song = activeSongs.find(s => s.id === songId);
    if (song) {
      const link = document.createElement('a');
      link.href = song.audioFile;
      link.download = `${song.artist} - ${song.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    activeSongs,
    excludedSongs,
    currentSongIndex,
    currentSong: activeSongs[currentSongIndex],
    currentTime,
    isPlaying,
    isLoading: isLoading || configLoading,
    setCurrentSongIndex,
    setCurrentTime,
    setIsPlaying,
    markSongAsPlayed,
    toggleSongPlaylist,
    moveSongUp,
    moveSongDown,
    moveSongToStart,
    moveSongToEnd,
    downloadSong,
    personalPlaylist,
    togglePersonalPlaylist,
  };
};
