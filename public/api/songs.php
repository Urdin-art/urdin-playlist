<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 

// --- Funciones de Ayuda ---

// Comprobar si la extensión GD está habilitada
if (!extension_loaded('gd')) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'La extensión GD de PHP no está habilitada en el servidor. Es necesaria para el procesamiento de imágenes.']);
    exit;
}

// Normaliza una ruta de sistema de archivos a una ruta web
function to_web_path($file_system_path) {
    $web_path = str_replace(rtrim($_SERVER['DOCUMENT_ROOT'], '/\\'), '', $file_system_path);
    return str_replace('\\', '/', $web_path);
}

// Procesa y redimensiona una imagen
function process_image($file_key, &$progress_log) {
    if (!isset($_FILES[$file_key]) || $_FILES[$file_key]['error'] === UPLOAD_ERR_NO_FILE) {
        $progress_log[] = "ℹ️ No se subió carátula, se usará la de por defecto.";
        return null;
    }
    
    $file = $_FILES[$file_key];
    $target_dir = $_SERVER['DOCUMENT_ROOT'] . '/albums/';
    if (!is_dir($target_dir)) mkdir($target_dir, 0755, true);
    if (!is_writable($target_dir)) throw new Exception("Error de permisos: El directorio '{$target_dir}' no tiene permisos de escritura.");

    $file_base_name = uniqid();
    $jpg_target_path = $target_dir . $file_base_name . '.jpg';

    // ... (código de procesado de imagen) ...
    $tmp_name = $file['tmp_name'];
    list($width, $height, $type) = getimagesize($tmp_name);
    $src_image = null;
    switch ($type) {
        case IMAGETYPE_JPEG: $src_image = imagecreatefromjpeg($tmp_name); break;
        case IMAGETYPE_PNG: $src_image = imagecreatefrompng($tmp_name); break;
        case IMAGETYPE_WEBP: $src_image = imagecreatefromwebp($tmp_name); break;
        default: throw new Exception("Tipo de imagen no soportado.");
    }
    $ratio = $width / $height;
    if (500 / 500 > $ratio) { $new_width = 500 * $ratio; $new_height = 500; }
    else { $new_width = 500; $new_height = 500 / $ratio; }
    $dst_image = imagecreatetruecolor($new_width, $new_height);
    imagecopyresampled($dst_image, $src_image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
    imagejpeg($dst_image, $jpg_target_path, 85);
    imagedestroy($src_image);
    imagedestroy($dst_image);
    
    $progress_log[] = "✔️ Carátula procesada: " . basename($jpg_target_path);

    // Manejar la portada animada (MP4)
    if (isset($_FILES['animatedAlbumArt']) && $_FILES['animatedAlbumArt']['error'] === UPLOAD_ERR_OK) {
        $mp4_target_path = $target_dir . $file_base_name . '.mp4';
        if (move_uploaded_file($_FILES['animatedAlbumArt']['tmp_name'], $mp4_target_path)) {
            $progress_log[] = "✔️ Portada animada subida: " . basename($mp4_target_path);
        } else {
            $progress_log[] = "⚠️ Error al mover la portada animada.";
        }
    }

    return to_web_path($jpg_target_path);
}

// Sube un archivo en crudo
function upload_raw_file($file_key, $target_dir_name, $log_name, &$progress_log, $is_required = false) {
    if (!isset($_FILES[$file_key]) || $_FILES[$file_key]['error'] === UPLOAD_ERR_NO_FILE) {
        if ($is_required) throw new Exception("Error: El archivo '{$log_name}' es obligatorio.");
        return null;
    }

    $file = $_FILES[$file_key];
    $target_dir = $_SERVER['DOCUMENT_ROOT'] . $target_dir_name;

    // Manejo de errores de subida de PHP
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $error_messages = [
            UPLOAD_ERR_INI_SIZE   => "El archivo excede la directiva 'upload_max_filesize' en php.ini.",
            UPLOAD_ERR_FORM_SIZE  => "El archivo excede la directiva MAX_FILE_SIZE especificada en el formulario HTML.",
            UPLOAD_ERR_PARTIAL    => "El archivo fue solo parcialmente subido.",
            UPLOAD_ERR_NO_TMP_DIR => "Falta una carpeta temporal.",
            UPLOAD_ERR_CANT_WRITE => "No se pudo escribir el archivo en el disco.",
            UPLOAD_ERR_EXTENSION  => "Una extensión de PHP detuvo la subida del archivo.",
        ];
        $error_message = $error_messages[$file['error']] ?? "Error de subida desconocido.";
        throw new Exception("Error en '{$log_name}': {$error_message}");
    }

    if (!is_dir($target_dir)) mkdir($target_dir, 0755, true);
    if (!is_writable($target_dir)) throw new Exception("Error de permisos: El directorio '{$target_dir}' no tiene permisos de escritura.");
    
    $file_name = uniqid() . '_' . basename($file['name']);
    $target_path = $target_dir . $file_name;

    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        $progress_log[] = "✔️ {$log_name} subido: " . basename($target_path);
        return to_web_path($target_path);
    } else {
        throw new Exception("Error fatal al mover el archivo '{$log_name}' al directorio de destino.");
    }
}

// --- Lógica del Endpoint ---

$method = $_SERVER['REQUEST_METHOD'];
$master_playlist_path = $_SERVER['DOCUMENT_ROOT'] . '/songs-master.json';

if ($method === 'GET') {
    if (file_exists($master_playlist_path)) {
        header("Content-Type: application/json");
        readfile($master_playlist_path);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Master playlist not found.']);
    }
    exit;
}

if ($method === 'POST') {
    $progress_log = [];
    try {
        $progress_log[] = "Iniciando proceso de subida...";
        
        $file_paths = [];
        $file_paths['audioFile'] = upload_raw_file('audioFile', '/audio/', 'Archivo de audio', $progress_log, true);
        $file_paths['albumArt'] = process_image('albumArt', $progress_log);
        $file_paths['lyricsFile'] = upload_raw_file('lyricsFile', '/lyrics/', 'Archivo de letra', $progress_log);
        // La portada animada se gestiona junto con la carátula principal

        $song_data = $_POST;
        $new_song_entry = [
            'id' => $song_data['id'],
            'title' => $song_data['title'],
            'artist' => $song_data['artist'],
            'album' => $song_data['album'],
            'duration' => '0:00',
            'audioFile' => $file_paths['audioFile'],
            'albumArt' => $file_paths['albumArt'] ?? '/albums/placeholder.png',
            'lyricsFile' => $file_paths['lyricsFile'] ?? '',
        ];

        require_once('lib/getid3/getid3.php');
        $getID3 = new getID3;
        $audio_path = $_SERVER['DOCUMENT_ROOT'] . $file_paths['audioFile'];
        if (file_exists($audio_path)) {
            $file_info = $getID3->analyze($audio_path);
            if (!empty($file_info['playtime_string'])) {
                $new_song_entry['duration'] = $file_info['playtime_string'];
                $progress_log[] = "✔️ Duración calculada: " . $new_song_entry['duration'];
            } else {
                $progress_log[] = "⚠️ No se pudo calcular la duración del audio.";
            }
        }

        if (!is_writable($master_playlist_path)) throw new Exception("Error: El archivo '{$master_playlist_path}' no es escribible.");
        $playlist_content = file_get_contents($master_playlist_path);
        if ($playlist_content === false) throw new Exception("Error: No se pudo leer songs-master.json.");
        $master_playlist = json_decode($playlist_content, true);
        if ($master_playlist === null) throw new Exception("Error: songs-master.json está corrupto o vacío.");

        $master_playlist[] = $new_song_entry;
        
        $bytes = file_put_contents($master_playlist_path, json_encode($master_playlist, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        if ($bytes === false) throw new Exception("Error fatal: No se pudo escribir en songs-master.json.");

        $progress_log[] = "✔️ Base de datos de canciones actualizada.";
        $progress_log[] = "¡Proceso completado con éxito!";

        http_response_code(201);
        echo json_encode(['status' => 'success', 'song' => $new_song_entry, 'progress_log' => $progress_log]);

    } catch (Exception $e) {
        http_response_code(400);
        $progress_log[] = "❌ ERROR: " . $e->getMessage();
        error_log('Error en songs.php: ' . $e->getMessage());
        echo json_encode(['status' => 'error', 'message' => $e->getMessage(), 'progress_log' => $progress_log]);
    }
    exit;
}

if ($method === 'DELETE') {
    // ... (código de borrado sin cambios) ...
    $data = json_decode(file_get_contents('php://input'), true);
    $song_id = $data['id'];
    if ($song_id) {
        $master_playlist = json_decode(file_get_contents($master_playlist_path), true);
        $new_playlist = array_values(array_filter($master_playlist, function($song) use ($song_id) {
            return $song['id'] !== $song_id;
        }));
        file_put_contents($master_playlist_path, json_encode($new_playlist, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo json_encode(['status' => 'success', 'message' => "Canción '{$song_id}' eliminada."]);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID de canción no proporcionado.']);
    }
    exit;
}
?>