import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "../ui/dialog";
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { API_BASE_URL } from '../../config';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Un tipo más estricto para los datos de configuración
type ConfigData = {
  logo: string;
  tagline?: string;
  tagline_html?: string;
  playlist: string;
  storage: string;
  use_exclusions: boolean;
  personal_list_button: { enabled: boolean; targetConfig?: string; };
  refresh_button: { enabled: boolean; };
  theme: string;
  colors?: { // colors is now optional
    primary: number;
    secondary: number;
    accent: number;
    text: {
      highlighted: string;
      dimmed: string;
      primary: string;
      secondary: string;
    };
    background: { gradient: string[]; };
    cards: { gradient: string[]; };
    subtitles: { base: number; };
  };
};

export function ConfigEditor({ configName, isOpen, onOpenChange, onConfigSaved }: { configName: string | null, isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onConfigSaved: () => void }) {
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState('');

  useEffect(() => {
    if (!configName) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch config and themes in parallel
        const [configRes, themesRes] = await Promise.all([
          fetch(`/api/configs.php?name=${configName}`),
          fetch(`/api/configs.php?list_themes`)
        ]);

        const config = await configRes.json();
        const themeList = await themesRes.json();

        // Remove sideSwitcher from the config
        if (config.sideSwitcher) {
          delete config.sideSwitcher;
        }

        setConfigData(config);
        setThemes(themeList);
        setJsonContent(JSON.stringify(config, null, 2));

      } catch (error) {
        console.error("Error fetching initial data:", error);
        setConfigData(null);
        setThemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [configName, isOpen]);

  const handleSave = async (dataToSave?: ConfigData) => {
    const currentData = dataToSave || configData;
    if (!configName || !currentData) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/configs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: configName, content: currentData }),
      });
      if (response.ok) {
        toast.success(`Configuración '${configName}' guardada correctamente.`);
        onConfigSaved();
      } else {
        throw new Error('Error al guardar la configuración.');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJson = () => {
    if (jsonContent.trim() === '') {
      toast.error('El contenido no puede estar vacío.');
      return;
    }

    try {
      const newConfigData = JSON.parse(jsonContent);

      if (!newConfigData.logo || !newConfigData.playlist || !newConfigData.theme) {
        toast.error('Error de formato: El JSON debe contener las claves \'logo\', \'playlist\' y \'theme\'.');
        return;
      }

      setConfigData(newConfigData);
      handleSave(newConfigData);
      setIsJsonEditorOpen(false);
    } catch (error) {
      toast.error('Error en el formato JSON. No se pudo guardar.');
      console.error("JSON Parse Error:", error);
    }
  };

  // Helper para manejar cambios en campos anidados
  const handleNestedChange = (path: string, value: any) => {
    setConfigData(prev => {
      if (!prev) return null;
      const keys = path.split('.');
      const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editando: {configName}</DialogTitle>
          <DialogDescription>Modifica los valores y guarda los cambios.</DialogDescription>
        </DialogHeader>
        {loading && <p>Cargando...</p>}
        {!loading && configData && (
          <Card className="pr-6 space-y-6 bg-card border-0 shadow-none">
            {/* General */}
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">General</h3>
              <Label>Ruta del Logo</Label>
              <Input value={configData.logo || ''} onChange={(e) => handleNestedChange('logo', e.target.value)} />
              <Label>Tagline (texto plano)</Label>
              <Input value={configData.tagline || ''} onChange={(e) => handleNestedChange('tagline', e.target.value)} />
              <Label>Tagline (HTML)</Label>
              <Input value={configData.tagline_html || ''} onChange={(e) => handleNestedChange('tagline_html', e.target.value)} />
              <Label>Playlist Activa</Label>
              <Input value={configData.playlist || ''} onChange={(e) => handleNestedChange('playlist', e.target.value)} />
              <Label>Clave de LocalStorage</Label>
              <Input value={configData.storage || ''} onChange={(e) => handleNestedChange('storage', e.target.value)} />
            </div>

            {/* Switches */}
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Opciones</h3>
              <div className="flex items-center space-x-2">
                <Checkbox checked={configData.use_exclusions} onCheckedChange={(checked) => handleNestedChange('use_exclusions', checked)} />
                <Label>Usar Exclusiones</Label>
              </div>
               <div className="flex items-center space-x-2">
                <Checkbox checked={configData.personal_list_button?.enabled ?? false} onCheckedChange={(checked) => handleNestedChange('personal_list_button.enabled', checked)} />
                <Label>Botón "Mi Lista"</Label>
              </div>
               <div className="flex items-center space-x-2">
                <Checkbox checked={configData.refresh_button?.enabled ?? false} onCheckedChange={(checked) => handleNestedChange('refresh_button.enabled', checked)} />
                <Label>Botón "Refrescar"</Label>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Tema</h3>
              <Select
                value={configData.theme}
                onValueChange={(value) => handleNestedChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar un tema" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map(theme => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </Card>
        )}
        <div className="pt-4 border-t flex gap-2">
          <Button onClick={() => handleSave()} disabled={loading} className="synthwave-button">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Button onClick={() => setIsJsonEditorOpen(true)} disabled={loading} className="synthwave-button">
            Editar JSON
          </Button>
        </div>
      </DialogContent>
      <Dialog open={isJsonEditorOpen} onOpenChange={setIsJsonEditorOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Editor JSON: {configName}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            className="bg-gray-900 text-white font-mono flex-grow"
          />
          <div className="pt-4 border-t">
            <Button onClick={handleSaveJson} className="synthwave-button">
              Guardar JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
