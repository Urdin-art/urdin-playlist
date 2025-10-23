import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SongManager } from '@/components/admin/SongManager';
import { PlaylistManager } from '@/components/admin/PlaylistManager';
import { useAppConfig } from '@/hooks/useAppConfig';
import { LogoLoader } from '@/components/LogoLoader';
import { ConfigEditor } from '@/components/admin/ConfigEditor';
import { ThemeEditor } from '@/components/admin/ThemeEditor';
import { OrphanFileManager } from '@/components/admin/OrphanFileManager';
import { PlaylistModalManager } from '@/components/admin/PlaylistModalManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AdminPage() {
  const { config, isLoading: isThemeLoading, error: themeError } = useAppConfig('admin-side');
  const [configs, setConfigs] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Record<string, string[]>>({});
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigEditorOpen, setIsConfigEditorOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const buttonStyle = {
    background: 'var(--simple-accent)',
    color: '#000',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem'
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [configsRes, themesRes, playlistsRes, songsRes] = await Promise.all([
        fetch(`/api/configs.php`),
        fetch(`/api/themes.php`),
        fetch(`/api/playlists.php`),
        fetch(`/api/songs.php`)
      ]);
      const configsData = await configsRes.json();
      const themesData = await themesRes.json();
      const playlistFilesData = await playlistsRes.json();
      const songsData = await songsRes.json();
      
      setConfigs(configsData || []);
      setThemes(themesData || []);
      setAllSongs(songsData);

      const playlistsContent: Record<string, string[]> = {};
      if(playlistFilesData && Array.isArray(playlistFilesData)) {
        for (const file of playlistFilesData) {
          const res = await fetch(`/api/playlists.php?name=${file}`);
          playlistsContent[file] = await res.json();
        }
      }
      setPlaylists(playlistsContent);

    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDeleteConfig = async (configName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar ${configName}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/configs.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: configName }),
      });
      if (!response.ok) throw new Error('Error al eliminar la configuración.');
      fetchAllData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateConfig = async () => {
    const sideName = prompt("Introduce el nombre para la nueva cara (ej. C):");
    if (!sideName) return;

    const newConfigName = `${sideName}-side.json`;

    // Usaremos A-side.json como plantilla
    const templateResponse = await fetch(`/A-side.json`);
    const templateData = await templateResponse.json();

    try {
      const response = await fetch(`/api/configs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newConfigName, content: templateData }),
      });
      if (!response.ok) throw new Error('Error al crear la configuración.');
      fetchAllData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTheme = async () => {
    const themeName = prompt("Introduce el ID para el nuevo tema (ej. C):");
    if (!themeName) return;

    const newThemeName = `theme-${themeName}.json`;

    // Usaremos theme-A.json como plantilla
    const templateResponse = await fetch(`/theme-A.json`);
    const templateData = await templateResponse.json();

    try {
      const response = await fetch(`/api/themes.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newThemeName, content: templateData }),
      });
      if (!response.ok) throw new Error('Error al crear el tema.');
      fetchAllData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTheme = async (themeName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el tema ${themeName}?`)) {
      return;
    }
    try {
      await fetch(`/api/themes.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: themeName }),
      });
      fetchAllData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreatePlaylist = async () => {
    const playlistIdentifier = prompt("Introduce el identificador para la nueva playlist (ej. c):");
    if (!playlistIdentifier) return;
    const newPlaylistName = `songs-${playlistIdentifier}.json`;
    try {
      await fetch(`/api/playlists.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName, songs: [] }),
      });
      fetchAllData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePlaylist = async (playlistName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la playlist ${playlistName}?`)) {
      return;
    }
    try {
      await fetch(`/api/playlists.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playlistName }),
      });
      fetchAllData();
    } catch (error) {
      console.error(error);
    }
  };

  if (isThemeLoading) {
    return <div>Cargando tema...</div>; // O un spinner más elegante
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--simple-page-background)' }}>
      <header className="text-center py-8">
        {config?.logo && <LogoLoader logoPath={config.logo} alt="Logo" className="w-auto h-auto mx-auto mb-4" />}
        {config?.tagline && <p style={{ color: 'var(--simple-primary)' }} className="mt-4">{config.tagline}</p>}
        {config?.tagline_html && <p style={{ color: 'var(--simple-primary)' }} className="mt-2" dangerouslySetInnerHTML={{ __html: config.tagline_html }} />}
      </header>
      <main className="flex-grow space-y-8 px-4 sm:px-8 lg:px-12 pb-8">
        <Tabs defaultValue="configs" className="w-full">
          <TabsList>
            <TabsTrigger value="configs">Configuración</TabsTrigger>
            <TabsTrigger value="themes">Temas</TabsTrigger>
            <TabsTrigger value="songs">Canciones</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="files">Archivos</TabsTrigger>
          </TabsList>

          <TabsContent value="configs">
            <Card style={{ backgroundColor: 'var(--simple-card-background)' }} className="rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ color: 'var(--simple-accent)' }}>Archivos de Configuración</CardTitle>
                <Button onClick={handleCreateConfig} className="synthwave-button">Crear Nuevo</Button>
              </CardHeader>
              <CardContent>
                {loading && <p>Cargando...</p>}
                {error && <p className="text-red-500">{error}</p>}
                <ul className="space-y-2">
                  {configs.map((config) => (
                    <li key={config} style={{ backgroundColor: 'var(--simple-page-background)' }} className="flex items-center justify-between p-3 rounded-lg">
                      <span className="font-mono" style={{ color: 'var(--simple-primary)' }}>{config}</span>
                      <div className="flex gap-2">
                        <Button className="synthwave-button" onClick={() => {
                          setSelectedConfig(config);
                          setIsConfigEditorOpen(true);
                        }}>Editar</Button>
                        <Button className="synthwave-button synthwave-button-delete" onClick={() => handleDeleteConfig(config)}>Eliminar</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="themes">
            <Card style={{ backgroundColor: 'var(--simple-card-background)' }} className="rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle style={{ color: 'var(--simple-accent)' }}>Temas</CardTitle>
                <Button onClick={handleCreateTheme} className="synthwave-button">Crear Nuevo</Button>
              </CardHeader>
              <CardContent>
                {loading && <p>Cargando...</p>}
                {error && <p className="text-red-500">{error}</p>}
                <ul className="space-y-2">
                  {themes.map((theme) => (
                    <li key={theme} style={{ backgroundColor: 'var(--simple-page-background)' }} className="flex items-center justify-between p-3 rounded-lg">
                      <span className="font-mono" style={{ color: 'var(--simple-secondary)' }}>{theme}</span>
                      <div className="flex gap-2">
                        <Button className="synthwave-button" onClick={() => {
                          setSelectedTheme(theme);
                          setIsThemeEditorOpen(true);
                        }}>Editar</Button>
                        <Button className="synthwave-button synthwave-button-delete" onClick={() => handleDeleteTheme(theme)}>Eliminar</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="songs">
            <Card style={{ backgroundColor: 'var(--simple-card-background)' }} className="rounded-lg">
              <CardHeader>
                <CardTitle style={{ color: 'var(--simple-accent)' }}>Canciones</CardTitle>
              </CardHeader>
              <CardContent>
                <SongManager songs={allSongs} playlists={playlists} fetchAllData={fetchAllData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playlists">
            <Card style={{ backgroundColor: 'var(--simple-card-background)' }} className="rounded-lg">
              <CardHeader>
                <CardTitle style={{ color: 'var(--simple-accent)' }}>Playlists</CardTitle>
              </CardHeader>
              <CardContent>
                <PlaylistManager
                  allSongs={allSongs}
                  playlists={playlists}
                  setPlaylists={setPlaylists}
                  fetchAllData={fetchAllData}
                  handleCreatePlaylist={handleCreatePlaylist}
                  handleDeletePlaylist={handleDeletePlaylist}
                />
                <PlaylistModalManager configs={configs} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card style={{ backgroundColor: 'var(--simple-card-background)' }} className="rounded-lg">
              <CardHeader>
                <CardTitle style={{ color: 'var(--simple-accent)' }}>Archivos Huérfanos</CardTitle>
              </CardHeader>
              <CardContent>
                <OrphanFileManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <ConfigEditor
        configName={selectedConfig}
        isOpen={isConfigEditorOpen}
        onOpenChange={setIsConfigEditorOpen}
        onConfigSaved={() => {
          setIsConfigEditorOpen(false);
          fetchAllData();
        }}
      />
      <ThemeEditor
        themeName={selectedTheme}
        isOpen={isThemeEditorOpen}
        onOpenChange={setIsThemeEditorOpen}
        onThemeSaved={() => {
          setIsThemeEditorOpen(false);
          fetchAllData();
        }}
      />
    </div>
  );
}

export default AdminPage;