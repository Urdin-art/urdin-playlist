import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { API_BASE_URL } from '@/config';
import { toast } from 'sonner';

export function OrphanFileManager() {
  const [orphans, setOrphans] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const findOrphans = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orphans.php`);
      const data = await response.json();
      setOrphans(data);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orphans.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: selected }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || `${selected.length} archivos eliminados.`);
        // Volver a buscar para actualizar la lista
        findOrphans();
      } else {
        throw new Error(data.error || 'Error al eliminar los archivos.');
      }
    } catch (error) {
      toast.error('Error al eliminar los archivos.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (file: string) => {
    setSelected(prev => 
      prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]
    );
  };

  return (
    <Card className="glass-effect card-glow">
      <CardHeader>
        <CardTitle className="gradient-text-primary">Gestor de Archivos Huérfanos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-dimmed mb-4">
          Busca archivos en las carpetas de audio, albums y lyrics que no estén siendo utilizados en `songs-master.json`.
        </p>
        <div className="flex gap-4">
          <Button onClick={findOrphans} disabled={loading} className="synthwave-button">
            {loading ? 'Buscando...' : 'Buscar Archivos Huérfanos'}
          </Button>
          {orphans.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected} disabled={selected.length === 0 || loading} className="synthwave-button synthwave-button-delete">
              Eliminar Seleccionados ({selected.length})
            </Button>
          )}
        </div>
        {orphans.length > 0 && (
          <ul className="mt-4 space-y-2">
            <div className="flex items-center p-2">
              <Checkbox
                id="select-all"
                checked={selected.length === orphans.length && orphans.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelected(orphans);
                  } else {
                    setSelected([]);
                  }
                }}
                className="mr-2"
              />
              <label htmlFor="select-all" className="font-semibold text-primary-custom">Seleccionar Todo</label>
            </div>
            {orphans.map(file => (
              <li key={file} className="flex items-center p-2 glass-effect border border-primary/20 rounded-lg">
                <Checkbox
                  id={file}
                  checked={selected.includes(file)}
                  onCheckedChange={() => toggleSelection(file)}
                  className="mr-2"
                />
                <label htmlFor={file} className="font-mono text-sm text-primary-custom">{file}</label>
              </li>
            ))}
          </ul>
        )}
        {orphans.length === 0 && !loading && <p className="mt-4 text-dimmed">No se encontraron archivos huérfanos.</p>}
      </CardContent>
    </Card>
  );
}