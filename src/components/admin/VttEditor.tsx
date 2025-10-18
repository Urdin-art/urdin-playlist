import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { API_BASE_URL } from '../../config';

export function VttEditor({ vttFile }: { vttFile: string | null }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(vttFile);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFile) return;
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/lyrics.php?file=${selectedFile}`);
        const text = await response.text();
        setContent(text);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [selectedFile]);

  const handleSave = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/lyrics.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: selectedFile, content }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mt-8 flex-grow flex flex-col">
      <CardHeader>
        <CardTitle>Editor de Subtítulos (VTT)</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <p className="text-sm text-gray-400 mb-4">Esta es una implementación básica. Un selector más avanzado podría listar todas las canciones y sus archivos VTT asociados.</p>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-gray-900 text-white font-mono flex-grow"
          disabled={!selectedFile || loading}
        />
        <Button className="synthwave-button mt-4" onClick={handleSave} disabled={!selectedFile || loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </CardContent>
    </Card>
  );
}