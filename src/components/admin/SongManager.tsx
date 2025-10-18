import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { AddSongForm } from './AddSongForm';
import { API_BASE_URL } from '../../config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { VttEditor } from './VttEditor';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  lyricsFile?: string;
}

export function SongManager({ songs, playlists, fetchAllData }: { songs: any[], playlists: Record<string, string[]>, fetchAllData: () => void }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVttEditorOpen, setIsVttEditorOpen] = useState(false);
  const [selectedVttFile, setSelectedVttFile] = useState<string | null>(null);
  const [isMasterEditorOpen, setIsMasterEditorOpen] = useState(false);
  const [masterJsonContent, setMasterJsonContent] = useState('');
  const [loadingMasterJson, setLoadingMasterJson] = useState(false);

  useEffect(() => {
    if (isMasterEditorOpen) {
      const fetchMasterJson = async () => {
        setLoadingMasterJson(true);
        try {
          const response = await fetch(`/songs-master.json?t=${new Date().getTime()}`);
          const text = await response.text();
          setMasterJsonContent(text);
        } catch (error) {
          console.error("Error fetching songs-master.json:", error);
        } finally {
          setLoadingMasterJson(false);
        }
      };
      fetchMasterJson();
    }
  }, [isMasterEditorOpen]);

  const handleSaveMasterJson = async () => {
    if (masterJsonContent.trim() === '') {
      toast.error('El contenido no puede estar vacío.');
      return;
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(masterJsonContent);
    } catch (error) {
      toast.error('Error de sintaxis: El contenido no es un JSON válido.');
      console.error("JSON Parse Error:", error);
      return;
    }

    if (!Array.isArray(parsedJson)) {
      toast.error('Error de formato: El JSON principal debe ser un array de canciones.');
      return;
    }

    setLoadingMasterJson(true);
    try {
      const response = await fetch(`${API_BASE_URL}/configs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'songs-master.json', content: parsedJson, isRootFile: true }),
      });

      if (response.ok) {
        toast.success('songs-master.json guardado correctamente.');
        fetchAllData(); // Recargar datos
        setIsMasterEditorOpen(false);
      } else {
        throw new Error('Error al guardar songs-master.json.');
      }
    } catch (error) {
      toast.error('Error al guardar el archivo en el servidor.');
      console.error(error);
    } finally {
      setLoadingMasterJson(false);
    }
  };

  const handleSongAdded = () => {
    setIsFormOpen(false);
    fetchAllData();
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la canción ${songId}?`)) {
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/songs.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: songId }),
      });
      fetchAllData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToList = async (songId: string, playlistName: string) => {
    const currentList = playlists[playlistName] || [];
    const isInList = currentList.includes(songId);
    const newList = isInList
      ? currentList.filter(id => id !== songId)
      : [...currentList, songId];

    try {
      await fetch(`${API_BASE_URL}/playlists.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playlistName, songs: newList }),
      });
      fetchAllData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card className="glass-effect card-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="gradient-text-primary">Gestor de Canciones (songs-master.json)</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="synthwave-button">Añadir Nueva Canción</Button>
          </DialogTrigger>
          <DialogContent style={{ backgroundColor: 'var(--simple-card-background)' }} className="text-primary-custom max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="gradient-text-secondary">Añadir Nueva Canción</DialogTitle>
            </DialogHeader>
            <AddSongForm onSongAdded={handleSongAdded} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {songs.map((song) => (
            <li key={song.id} className="flex items-center justify-between p-3 glass-effect border border-primary/20 rounded-lg">
              <div>
                <p className="font-bold text-primary-custom">{song.title}</p>
                <p className="text-sm text-dimmed">{song.artist} - {song.album}</p>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="synthwave-button">Añadir a...</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-effect text-primary-custom">
                    {Object.keys(playlists).map(playlistName => (
                      <DropdownMenuItem key={playlistName} onSelect={(e) => e.preventDefault()}>
                        <Checkbox
                          className="mr-2"
                          onCheckedChange={() => handleAddToList(song.id, playlistName)}
                          checked={playlists[playlistName]?.includes(song.id)}
                        />
                        {playlistName}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {song.lyricsFile && (
                  <Button variant="outline" className="synthwave-button" onClick={() => {
                    const fileName = song.lyricsFile.split('/').pop();
                    if (fileName) {
                      setSelectedVttFile(fileName);
                      setIsVttEditorOpen(true);
                    }
                  }}>Editar Letra</Button>
                )}
                <Button variant="destructive" onClick={() => handleDeleteSong(song.id)} className="synthwave-button synthwave-button-delete">Eliminar</Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Button className="synthwave-button" onClick={() => setIsMasterEditorOpen(true)}>Editar songs-master.json</Button>
        </div>
      </CardContent>
      <Dialog open={isVttEditorOpen} onOpenChange={setIsVttEditorOpen}>
        <DialogContent className="glass-effect text-primary-custom max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="gradient-text-secondary">Editor de Letras: {selectedVttFile}</DialogTitle>
          </DialogHeader>
          <VttEditor vttFile={selectedVttFile} />
        </DialogContent>
      </Dialog>
      <Dialog open={isMasterEditorOpen} onOpenChange={setIsMasterEditorOpen}>
        <DialogContent className="glass-effect text-primary-custom max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="gradient-text-secondary">Editor de songs-master.json</DialogTitle>
          </DialogHeader>
          <div className="flex-grow flex flex-col">
            {loadingMasterJson ? (
              <p>Cargando...</p>
            ) : (
              <Textarea
                value={masterJsonContent}
                onChange={(e) => setMasterJsonContent(e.target.value)}
                className="bg-gray-900 text-white font-mono flex-grow"
              />
            )}
          </div>
          <div className="pt-4 border-t">
            <Button onClick={handleSaveMasterJson} disabled={loadingMasterJson} className="synthwave-button">
              {loadingMasterJson ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
