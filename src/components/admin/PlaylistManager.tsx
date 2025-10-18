import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { API_BASE_URL } from '@/config';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Song {
  id: string;
  title: string;
}

export function PlaylistManager({ allSongs, playlists, setPlaylists, fetchAllData, handleCreatePlaylist, handleDeletePlaylist }: { allSongs: any[], playlists: Record<string, string[]>, setPlaylists: any, fetchAllData: () => void, handleCreatePlaylist: () => void, handleDeletePlaylist: (name: string) => void }) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

  const onDragEnd = (result: any) => {
    if (!result.destination || !selectedPlaylist) return;
    const items = Array.from(playlists[selectedPlaylist]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPlaylists((prev: any) => ({ ...prev, [selectedPlaylist]: items }));
  };

  const handleRemoveFromPlaylist = (songId: string) => {
    if (!selectedPlaylist) return;
    const newList = playlists[selectedPlaylist].filter(id => id !== songId);
    setPlaylists((prev: any) => ({ ...prev, [selectedPlaylist]: newList }));
  };

  const handleAddToPlaylist = (songId: string) => {
    if (!selectedPlaylist) return;
    const currentList = playlists[selectedPlaylist] || [];
    if (!currentList.includes(songId)) {
        const newList = [...currentList, songId];
        setPlaylists((prev: any) => ({ ...prev, [selectedPlaylist]: newList }));
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedPlaylist) return;
    try {
      const response = await fetch(`${API_BASE_URL}/playlists.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedPlaylist, songs: playlists[selectedPlaylist] }),
      });
      if (response.ok) {
        toast.success(`Playlist '${selectedPlaylist}' guardada correctamente.`);
      } else {
        throw new Error('Error al guardar la playlist.');
      }
    } catch (error) {
      toast.error('Error al guardar la playlist.');
      console.error(error);
    }
  };

  return (
    <Card className="glass-effect card-glow">
      <CardHeader>
        <CardTitle className="gradient-text-primary">Gestor de Playlists</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex gap-4 items-center">
            <Select onValueChange={setSelectedPlaylist} value={selectedPlaylist || ''}>
              <SelectTrigger className="w-[280px] synthwave-button-secondary">
                <SelectValue placeholder="Selecciona una playlist" />
              </SelectTrigger>
              <SelectContent className="glass-effect text-primary-custom">
                {Object.keys(playlists).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleCreatePlaylist} className="synthwave-button">Crear Playlist</Button>
            {selectedPlaylist && (
              <Dialog open={isAddSongModalOpen} onOpenChange={setIsAddSongModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="synthwave-button">Añadir Canción</Button>
                </DialogTrigger>
                <DialogContent className="glass-effect text-primary-custom max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="gradient-text-secondary">Añadir canción a {selectedPlaylist}</DialogTitle>
                  </DialogHeader>
                  <div>
                    <ul className="space-y-2">
                      {allSongs
                        .filter(song => !playlists[selectedPlaylist]?.includes(song.id))
                        .map(song => (
                          <li key={song.id} className="flex items-center justify-between p-2 glass-effect border border-primary/20 rounded-lg">
                            <span className="text-primary-custom">{song.title}</span>
                            <Button size="sm" className="synthwave-button" onClick={() => handleAddToPlaylist(song.id)}>Añadir</Button>
                          </li>
                        ))}
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          {selectedPlaylist && (
            <div className="flex gap-4">
              <Button onClick={handleSaveChanges} className="synthwave-button">Guardar Cambios</Button>
              <Button variant="destructive" onClick={() => handleDeletePlaylist(selectedPlaylist)} className="synthwave-button synthwave-button-delete">Eliminar Playlist</Button>
            </div>
          )}
        </div>
        {selectedPlaylist && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="playlist">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {(playlists[selectedPlaylist] || []).map((id, index) => {
                    const song = allSongs.find(s => s.id === id);
                    return (
                      <Draggable key={id} draggableId={id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-3 glass-effect border border-primary/20 rounded-lg"
                          >
                            <span className="text-primary-custom">{index + 1}. {song ? song.title : id}</span>
                            <Button variant="destructive" size="sm" onClick={() => handleRemoveFromPlaylist(id)} className="synthwave-button synthwave-button-delete">X</Button>
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
}