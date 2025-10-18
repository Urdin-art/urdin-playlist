<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$method = $_SERVER['REQUEST_METHOD'];
$public_path = $_SERVER['DOCUMENT_ROOT'];

if ($method === 'GET') {
    try {
        $master_playlist_path = $public_path . '/songs-master.json';
        if (!file_exists($master_playlist_path)) {
            throw new Exception('songs-master.json no encontrado.');
        }
        $songs = json_decode(file_get_contents($master_playlist_path), true);

        // 1. Crear una lista de todos los archivos en uso
        $used_files = [];
        foreach ($songs as $song) {
            if (!empty($song['audioFile'])) $used_files[] = $song['audioFile'];
            if (!empty($song['albumArt'])) $used_files[] = $song['albumArt'];
            if (!empty($song['lyricsFile'])) $used_files[] = $song['lyricsFile'];
        }
        // Normalizar las rutas para la comparación
        $used_files = array_map(function($path) {
            return ltrim($path, '/');
        }, $used_files);


        // 2. Escanear los directorios
        $scan_dirs = ['/audio', '/albums', '/lyrics'];
        $all_files_on_disk = [];
        foreach ($scan_dirs as $dir) {
            $files = glob($public_path . $dir . '/*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    $all_files_on_disk[] = ltrim(str_replace($public_path, '', $file), '/');
                }
            }
        }

        // 3. Comparar y encontrar los huérfanos
        $orphan_files = array_diff($all_files_on_disk, $used_files);

        echo json_encode(array_values($orphan_files));

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $files_to_delete = $data['files'];

    if (is_array($files_to_delete)) {
        $deleted_count = 0;
        foreach ($files_to_delete as $file) {
            $file_path = $public_path . '/' . ltrim($file, '/');
            if (file_exists($file_path)) {
                if (unlink($file_path)) {
                    $deleted_count++;
                }
            }
        }
        echo json_encode(['status' => 'success', 'message' => "{$deleted_count} archivos eliminados."]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Se esperaba un array de archivos.']);
    }
}
?>