import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { API_BASE_URL } from '@/config';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface PlaylistItem {
  title: string;
  config: string;
}

export function PlaylistModalManager({ configs }: { configs: string[] }) {
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/configs.php?name=playlists.json`);
        const data = await response.json();
        setPlaylists(data.playlists || []);
      } catch (error) {
        console.error("Error fetching playlists.json:", error);
        toast.error('Error al cargar la configuración del modal de playlists.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/configs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'playlists.json', content: { playlists: playlists } }),
      });
      if (response.ok) {
        toast.success('Configuración del modal de playlists guardada correctamente.');
      } else {
        throw new Error('Error al guardar la configuración.');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración.');
      console.error(error);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(playlists);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPlaylists(items);
  };

  const handleAddItem = () => {
    setPlaylists([...playlists, { title: 'Nueva Playlist', config: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const newPlaylists = [...playlists];
    newPlaylists.splice(index, 1);
    setPlaylists(newPlaylists);
  };

  const handleItemChange = (index: number, field: keyof PlaylistItem, value: string) => {
    const newPlaylists = [...playlists];
    newPlaylists[index] = { ...newPlaylists[index], [field]: value };
    setPlaylists(newPlaylists);
  };

  return (
    <Card className="glass-effect card-glow mt-8">
      <CardHeader>
        <CardTitle className="gradient-text-primary">Editor del Modal de Playlists</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4">
            <Button onClick={handleAddItem} className="synthwave-button w-fit">Añadir Enlace</Button>
            <Button onClick={handleSave} className="synthwave-button w-fit">Guardar Cambios</Button>
        </div>
        {loading ? <p>Cargando...</p> : (
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="playlist-modal-items">
                {(provided) => (
                    <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {playlists.map((item, index) => (
                        <Draggable key={index} draggableId={`item-${index}`} index={index}>
                        {(provided) => (
                            <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center justify-between p-3 glass-effect border border-primary/20 rounded-lg"
                            >
                                <div className="flex items-center gap-4 flex-grow">
                                    <Input 
                                        value={item.title} 
                                        onChange={(e) => handleItemChange(index, 'title', e.target.value)} 
                                        className="admin-form-input"
                                    />
                                    <Select onValueChange={(value) => handleItemChange(index, 'config', value)} value={item.config}>
                                        <SelectTrigger className="w-[280px] synthwave-button-secondary">
                                            <SelectValue placeholder="Selecciona un config" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-effect text-primary-custom">
                                            {configs.map(c => <SelectItem key={c} value={c.replace('-side.json', '')}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(index)} className="synthwave-button synthwave-button-delete ml-4">X</Button>
                            </li>
                        )}
                        </Draggable>
                    ))}
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
