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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { API_BASE_URL } from '../../config';
import { toast } from 'sonner';
import { ColorPicker } from './ColorPicker';
import { Textarea } from '../ui/textarea';

// Define the full, detailed theme structure
interface CompleteTheme {
    buttons: { [key: string]: any };
    backgrounds: { [key: string]: any };
    text: { [key: string]: any };
    lyricsCard: { [key: string]: any };
    borders: { [key: string]: any };
    glows: { [key: string]: any };
    menu: { [key: string]: any };
}

interface SimpleTheme {
    primary: string;
    secondary: string;
    accent: string;
    cardBackground: string;
    pageBackground: string;
}

interface ThemeData {
    simple: SimpleTheme;
    complete: CompleteTheme;
}

// Helper function to generate derived colors
const deriveColor = (base: string, saturation_mod: number, lightness_mod: number, alpha_mod: number): string => {
    try {
        const [hue, saturation, lightness] = base.match(/\d+/g)!.map(Number);
        return `hsla(${hue}, ${Math.min(100, saturation + saturation_mod)}%, ${Math.min(100, lightness + lightness_mod)}%, ${alpha_mod.toFixed(2)})`;
    } catch (e) {
        return base; // Return base color if parsing fails
    }
};

export function ThemeEditor({ themeName, isOpen, onOpenChange, onThemeSaved }: { themeName: string | null, isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onThemeSaved: () => void }) {
  const [themeData, setThemeData] = useState<ThemeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState('');

  useEffect(() => {
    if (!themeName || !isOpen) return;
    const fetchTheme = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/themes.php?name=${themeName}`);
        const data = await response.json();
        if (data.complete) {
          if (data.complete.navigation) {
            delete data.complete.navigation;
          }
          if (data.complete.glows && data.complete.glows.menu) {
            delete data.complete.glows.menu;
          }
          if (data.complete.borders && data.complete.borders.menu) {
            delete data.complete.borders.menu;
          }
        }
        setThemeData(data);
        setJsonContent(JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error fetching theme:", error);
        setThemeData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTheme();
  }, [themeName, isOpen]);

  const handleSave = async (dataToSave?: ThemeData) => {
    const currentData = dataToSave || themeData;
    if (!themeName || !currentData) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/themes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: themeName, content: currentData }),
      });

      if (response.ok) {
        toast.success(`Tema '${themeName}' guardado correctamente.`);
        onThemeSaved();
      } else {
        let errorMessage = `Error del servidor: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Not a JSON response
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      toast.error(`Error al guardar el tema: ${error.message}`);
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
      const newThemeData = JSON.parse(jsonContent);

      if (!newThemeData.simple || !newThemeData.complete) {
        toast.error('Error de formato: El JSON del tema debe tener las propiedades \'simple\' y \'complete\'.');
        return;
      }

      setThemeData(newThemeData);
      handleSave(newThemeData);
      setIsJsonEditorOpen(false);
    } catch (error) {
      toast.error('Error en el formato JSON. No se pudo guardar.');
      console.error("JSON Parse Error:", error);
    }
  };

  const handleSimpleChange = (field: keyof SimpleTheme, value: string) => {
    if (!themeData) return;

    const newSimple = { ...themeData.simple, [field]: value };
    const p = newSimple.primary;
    const s = newSimple.secondary;
    const a = newSimple.accent;
    const cardBg = newSimple.cardBackground;
    const pageBg = newSimple.pageBackground;

    const newComplete: CompleteTheme = {
        buttons: {
            inactive: {
                backgroundGradient: { from: deriveColor(p, -10, -20, 1), to: deriveColor(s, -10, -25, 1) },
                borderColor: deriveColor(p, 0, -10, 1),
                iconColor: deriveColor(p, 0, 20, 1),
                glowColor: deriveColor(p, 0, -10, 0.5),
            },
            hover: {
                backgroundGradient: { from: deriveColor(p, 10, -5, 1), to: deriveColor(a, 10, 0, 1) },
                borderColor: deriveColor(a, 10, 10, 1),
                iconColor: deriveColor(a, 0, 40, 1),
                glowColor: deriveColor(p, 10, -5, 0.8),
            },
            active: {
                backgroundGradient: { from: deriveColor(a, 10, 0, 1), to: deriveColor(p, 10, -5, 1) },
                borderColor: deriveColor(a, 0, -20, 1),
                iconColor: deriveColor(a, 0, 40, 1),
                glowColor: deriveColor(a, 10, 0, 0.9),
            },
            glowSize: "15px",
            borderRadius: "0.5rem",
        },
        backgrounds: {
            page: { from: deriveColor(pageBg, 0, 0, 1), to: deriveColor(pageBg, -10, -5, 1), type: "linear", angle: 135 },
            albumArtCard: { from: deriveColor(cardBg, 0, 0, 0.5), to: deriveColor(cardBg, -5, -5, 0.5), type: "linear", angle: 135 },
            playerCard: { from: deriveColor(cardBg, 0, 0, 0.5), to: deriveColor(cardBg, -5, -5, 0.5), type: "linear", angle: 135 },
            playlistCard: { from: deriveColor(cardBg, 0, 0, 0.5), to: deriveColor(cardBg, -5, -5, 0.5), type: "linear", angle: 135 },
            exclusionsCard: { from: deriveColor(cardBg, -5, -3, 0.5), to: deriveColor(cardBg, -10, -8, 0.5), type: "linear", angle: 135 },
        },
        text: {
            headerFooter: { normal: deriveColor(p, -10, 20, 1), highlighted: deriveColor(a, 10, 10, 1) },
            player: { title: deriveColor(p, 0, 30, 1), artist: deriveColor(s, 0, 20, 1), album: deriveColor(p, -10, 10, 1), timestamp: deriveColor(p, -10, 10, 1) },
            playlist: { title: deriveColor(p, 0, 30, 1), titleActive: deriveColor(p, 10, 35, 1), secondary: deriveColor(s, 0, 20, 0.8), icons: deriveColor(a, 10, 0, 1) },
        },
        lyricsCard: {
            background: deriveColor(s, -20, -30, 0.7),
            scanlines: deriveColor(s, 20, 30, 0.1),
            textHighlighted: deriveColor(s, 20, 30, 1),
            textDimmed: deriveColor(s, 0, -10, 1),
            glowColor: deriveColor(s, 20, 0, 0.7),
            glowSize: "30px",
            borderColor: deriveColor(s, 0, -20, 1),
            borderWidth: "2px",
            borderRadius: "1.5rem",
        },
        borders: {
            albumArtCard: { color: deriveColor(p, 10, -10, 0.7), width: "3px", radius: "1.5rem" },
            playerCard: { color: deriveColor(s, 0, -20, 0.7), width: "3px", radius: "1.5rem" },
            playlistCard: { color: deriveColor(a, 10, -10, 0.7), width: "3px", radius: "1.5rem" },
            playlistItem: { color: deriveColor(p, -10, -20, 0.5), width: "1px", radius: "0.75rem" },
            exclusionsCard: { color: deriveColor(p, -20, -30, 0.7), width: "3px", radius: "1.5rem" },
        },
        glows: {
            albumArtCard: { color: deriveColor(p, 20, 0, 0.4), size: "25px" },
            playerCard: { color: deriveColor(s, 10, -10, 0.4), size: "25px" },
            playlistCard: { color: deriveColor(a, 20, 0, 0.4), size: "25px" },
            playlistItem: { color: deriveColor(a, 20, 0, 0.7), size: "10px" },
            exclusionsCard: { color: deriveColor(p, 0, -20, 0.4), size: "25px" },
        },
        menu: {
            textColor: "hsla(0, 0%, 50%, 1.00)",
            buttonGradientColor: "hsla(0, 0%, 100%, 1.00)"
        },
    };

    setThemeData({ simple: newSimple, complete: newComplete });
  };

  const handleCompleteChange = (path: string, value: any) => {
    setThemeData(prev => {
      if (!prev) return null;
      const keys = path.split('.');
      const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
      let current = newState.complete;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const renderFormField = (path: string, label: string) => {
    const keys = path.split('.');
    let value = themeData?.complete as any;
    for (const key of keys) {
        if (value === undefined) {
            value = "";
            break;
        }
        value = value[key];
    }

    const valueStr = String(value || '').toLowerCase();
    const isColor = label.toLowerCase().includes('color') || 
                    path.toLowerCase().includes('color') || 
                    valueStr.startsWith('#') || 
                    valueStr.startsWith('rgb') || 
                    valueStr.startsWith('hsl');

    return (
        <div key={path} className="space-y-1">
            <Label>{label}</Label>
            {isColor ? (
                <ColorPicker 
                    value={value || 'rgba(255,255,255,1)'} 
                    onChange={(color) => handleCompleteChange(path, color)} 
                />
            ) : (
                <Input 
                    value={value || ''} 
                    onChange={(e) => handleCompleteChange(path, e.target.value)} 
                    placeholder="e.g., 15px or 1.5rem"
                />
            )}
        </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editando Tema: {themeName}</DialogTitle>
          <DialogDescription>Modifica los colores y guarda los cambios.</DialogDescription>
        </DialogHeader>
        {loading && <p>Cargando...</p>}
        {!loading && themeData && (
          <Card className="pr-6 space-y-6 bg-card border-0 shadow-none">
            
            <div className="space-y-2 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Configuración Simple</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.keys(themeData.simple).map(key => (
                  <div key={key} className="space-y-1">
                    <Label>{key}</Label>
                    <ColorPicker 
                      value={themeData.simple[key as keyof SimpleTheme]} 
                      onChange={(color) => handleSimpleChange(key as keyof SimpleTheme, color)} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger><h3 className="text-lg font-semibold">Configuración Completa</h3></AccordionTrigger>
                <AccordionContent className="space-y-4 p-2">
                  
                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="text-md font-semibold mb-2">Menú de Navegación</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {renderFormField("menu.textColor", "Color Texto/Icono")}
                      {renderFormField("menu.buttonGradientColor", "Color Superior Gradiente")}
                      {renderFormField("menu.gradientBottomColor", "Color Inferior Gradiente")}
                      {renderFormField("menu.borderColor", "Color Borde")}
                      {renderFormField("menu.borderWidth", "Ancho Borde")}
                      {renderFormField("menu.borderRadius", "Radio Borde")}
                    </div>
                  </div>


                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="text-md font-semibold mb-2">Botones</h4>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Inactivo</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("buttons.inactive.backgroundGradient.from", "Fondo (Desde)")}
                          {renderFormField("buttons.inactive.backgroundGradient.to", "Fondo (Hasta)")}
                          {renderFormField("buttons.inactive.borderColor", "Borde")}
                          {renderFormField("buttons.inactive.iconColor", "Icono")}
                          {renderFormField("buttons.inactive.glowColor", "Glow")}
                      </div>
                    </div>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Hover</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("buttons.hover.backgroundGradient.from", "Fondo (Desde)")}
                          {renderFormField("buttons.hover.backgroundGradient.to", "Fondo (Hasta)")}
                          {renderFormField("buttons.hover.borderColor", "Borde")}
                          {renderFormField("buttons.hover.iconColor", "Icono")}
                          {renderFormField("buttons.hover.glowColor", "Glow")}
                      </div>
                    </div>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Activo</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("buttons.active.backgroundGradient.from", "Fondo (Desde)")}
                          {renderFormField("buttons.active.backgroundGradient.to", "Fondo (Hasta)")}
                          {renderFormField("buttons.active.borderColor", "Borde")}
                          {renderFormField("buttons.active.iconColor", "Icono")}
                          {renderFormField("buttons.active.glowColor", "Glow")}
                      </div>
                    </div>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">General</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("buttons.glowSize", "Tamaño Glow")}
                          {renderFormField("buttons.borderRadius", "Radio del Borde")}
                          {renderFormField("buttons.borderWidth", "Ancho del Borde")}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="text-md font-semibold mb-2">Fondos</h4>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Página</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("backgrounds.page.from", "Desde")}
                          {renderFormField("backgrounds.page.to", "Hasta")}
                          {renderFormField("backgrounds.page.angle", "Ángulo")}
                          {renderFormField("backgrounds.page.type", "Tipo")}
                      </div>
                    </div>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Album Art</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("backgrounds.albumArtCard.from", "Desde")}
                          {renderFormField("backgrounds.albumArtCard.to", "Hasta")}
                          {renderFormField("backgrounds.albumArtCard.angle", "Ángulo")}
                          {renderFormField("backgrounds.albumArtCard.type", "Tipo")}
                      </div>
                    </div>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Player</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("backgrounds.playerCard.from", "Desde")}
                          {renderFormField("backgrounds.playerCard.to", "Hasta")}
                          {renderFormField("backgrounds.playerCard.angle", "Ángulo")}
                          {renderFormField("backgrounds.playerCard.type", "Tipo")}
                      </div>
                    </div>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Playlist</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("backgrounds.playlistCard.from", "Desde")}
                          {renderFormField("backgrounds.playlistCard.to", "Hasta")}
                          {renderFormField("backgrounds.playlistCard.angle", "Ángulo")}
                          {renderFormField("backgrounds.playlistCard.type", "Tipo")}
                      </div>
                    </div>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Exclusiones</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("backgrounds.exclusionsCard.from", "Desde")}
                          {renderFormField("backgrounds.exclusionsCard.to", "Hasta")}
                          {renderFormField("backgrounds.exclusionsCard.angle", "Ángulo")}
                          {renderFormField("backgrounds.exclusionsCard.type", "Tipo")}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="text-md font-semibold mb-2">Textos</h4>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Cabecera y Pie</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("text.headerFooter.normal", "Normal")}
                          {renderFormField("text.headerFooter.highlighted", "Resaltado")}
                      </div>
                    </div>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Player</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("text.player.title", "Título")}
                          {renderFormField("text.player.artist", "Artista")}
                          {renderFormField("text.player.album", "Álbum")}
                          {renderFormField("text.player.timestamp", "Tiempo")}
                      </div>
                    </div>
                    <div className="theme-editor-group">
                      <h5 className="text-sm font-semibold mb-2">Playlist</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {renderFormField("text.playlist.title", "Título")}
                          {renderFormField("text.playlist.titleActive", "Título Activo")}
                          {renderFormField("text.playlist.secondary", "Secundario")}
                          {renderFormField("text.playlist.icons", "Iconos")}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="text-md font-semibold mb-2">Tarjeta de Letras (Lyrics)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {renderFormField("lyricsCard.background", "Fondo")}
                      {renderFormField("lyricsCard.scanlines", "Scanlines")}
                      {renderFormField("lyricsCard.textHighlighted", "Texto Resaltado")}
                      {renderFormField("lyricsCard.textDimmed", "Texto Atenuado")}
                      {renderFormField("lyricsCard.glowColor", "Color Glow")}
                      {renderFormField("lyricsCard.glowSize", "Tamaño Glow")}
                      {renderFormField("lyricsCard.borderColor", "Color Borde")}
                      {renderFormField("lyricsCard.borderWidth", "Ancho Borde")}
                      {renderFormField("lyricsCard.borderRadius", "Radio Borde")}
                    </div>
                  </div>

                                    <div className="p-4 border rounded-lg space-y-2">
                                      <h4 className="text-md font-semibold mb-2">Bordes</h4>
                                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                          {renderFormField("borders.albumArtCard.color", "AlbumArt Color")}
                                          {renderFormField("borders.albumArtCard.width", "AlbumArt Ancho")}
                                          {renderFormField("borders.albumArtCard.radius", "AlbumArt Radio")}
                                          {renderFormField("borders.playerCard.color", "Player Color")}
                                          {renderFormField("borders.playerCard.width", "Player Ancho")}
                                          {renderFormField("borders.playerCard.radius", "Player Radio")}
                                          {renderFormField("borders.playlistCard.color", "Playlist Color")}
                                          {renderFormField("borders.playlistCard.width", "Playlist Ancho")}
                                          {renderFormField("borders.playlistCard.radius", "Playlist Radio")}
                                          {renderFormField("borders.playlistItem.color", "Item Playlist Color")}
                                          {renderFormField("borders.playlistItem.width", "Item Playlist Ancho")}
                                          {renderFormField("borders.playlistItem.radius", "Item Playlist Radio")}
                                          {renderFormField("borders.exclusionsCard.color", "Exclusiones Color")}
                                          {renderFormField("borders.exclusionsCard.width", "Exclusiones Ancho")}
                                          {renderFormField("borders.exclusionsCard.radius", "Exclusiones Radio")}
                                       </div>
                                    </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="text-md font-semibold mb-2">Glows (Brillos)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {renderFormField("glows.albumArtCard.color", "AlbumArt Color")}
                      {renderFormField("glows.albumArtCard.size", "AlbumArt Tamaño")}
                      {renderFormField("glows.playerCard.color", "Player Color")}
                      {renderFormField("glows.playerCard.size", "Player Tamaño")}
                      {renderFormField("glows.playlistCard.color", "Playlist Color")}
                      {renderFormField("glows.playlistCard.size", "Playlist Tamaño")}
                      {renderFormField("glows.playlistItem.color", "Item Playlist Color")}
                      {renderFormField("glows.playlistItem.size", "Item Playlist Tamaño")}
                      {renderFormField("glows.exclusionsCard.color", "Exclusiones Color")}
                      {renderFormField("glows.exclusionsCard.size", "Exclusiones Tamaño")}
                    </div>
                  </div>

                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
            <DialogTitle>Editor JSON: {themeName}</DialogTitle>
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