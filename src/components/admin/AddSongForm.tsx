import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "../ui/sonner";
import { API_BASE_URL } from "@/config";

const formSchema = z.object({
  id: z.string().min(1, { message: "El ID es requerido." }),
  title: z.string().min(1, { message: "El título es requerido." }),
  artist: z.string().min(1, { message: "El artista es requerido." }),
  album: z.string(),
  audioFile: z.any().refine(file => file?.length == 1, "El archivo de audio es requerido."),
  albumArt: z.any().optional(),
  lyricsFile: z.any().optional(),
  animatedAlbumArt: z.any().optional(),
});

export function AddSongForm({ onSongAdded }: { onSongAdded: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      title: "",
      artist: "",
      album: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    
    formData.append('id', values.id);
    formData.append('title', values.title);
    formData.append('artist', values.artist);
    formData.append('album', values.album);
    formData.append('audioFile', values.audioFile[0]);
    if (values.albumArt?.[0]) formData.append('albumArt', values.albumArt[0]);
    if (values.lyricsFile?.[0]) formData.append('lyricsFile', values.lyricsFile[0]);
    if (values.animatedAlbumArt?.[0]) formData.append('animatedAlbumArt', values.animatedAlbumArt[0]);

    try {
      const response = await fetch(`${API_BASE_URL}/songs.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      // Mostrar logs de progreso
      if (result.progress_log && Array.isArray(result.progress_log)) {
          for (let i = 0; i < result.progress_log.length; i++) {
              await new Promise(resolve => setTimeout(resolve, i * 500)); // Delay para efecto visual
              const log = result.progress_log[i];
              if (log.startsWith('❌')) {
                  toast.error(log);
              } else if (log.startsWith('⚠️')) {
                  toast.warning(log);
              } else {
                  toast.info(log);
              }
          }
      }

      if (!response.ok) {
        throw new Error(result.message || 'Error desconocido al subir la canción.');
      }
      
      toast.success("¡Canción añadida a la base de datos!");
      form.reset();
      onSongAdded();
      
    } catch (error: any) {
      toast.error(error.message || "Error al conectar con el servidor.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Único</FormLabel>
              <FormControl>
                <Input placeholder="ej. cancion-nueva-123" {...field} className="admin-form-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título de la canción" {...field} className="admin-form-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="artist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artista</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del artista" {...field} className="admin-form-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="album"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Álbum</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del álbum" {...field} className="admin-form-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="audioFile"
          render={() => (
            <FormItem>
              <FormLabel>Archivo de Audio (MP3)</FormLabel>
              <FormControl>
                <Input type="file" accept=".mp3" {...form.register("audioFile")} className="admin-form-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="albumArt"
          render={() => (
            <FormItem>
              <FormLabel>Carátula (JPG, PNG)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/jpeg,image/png" {...form.register("albumArt")} className="admin-form-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lyricsFile"
          render={() => (
            <FormItem>
              <FormLabel>Letra (VTT)</FormLabel>
              <FormControl>
                <Input type="file" accept=".vtt" {...form.register("lyricsFile")} className="admin-form-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="animatedAlbumArt"
          render={() => (
            <FormItem>
              <FormLabel>Portada Animada (MP4)</FormLabel>
              <FormControl>
                <Input type="file" accept=".mp4" {...form.register("animatedAlbumArt")} className="admin-form-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="synthwave-button">
          {isSubmitting ? 'Subiendo...' : 'Añadir Canción'}
        </Button>
      </form>
    </Form>
  );
}
