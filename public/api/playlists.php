<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$method = $_SERVER['REQUEST_METHOD'];
$public_path = $_SERVER['DOCUMENT_ROOT'] . '/';

if ($method === 'GET') {
    // Si se pide una playlist específica
    if (isset($_GET['name'])) {
        $playlist_path = $public_path . $_GET['name'];
        if (file_exists($playlist_path)) {
            echo file_get_contents($playlist_path);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Playlist not found.']);
        }
    } else {
        // Si no, se devuelve la lista de todas las playlists
        $files = glob($public_path . 'songs-*.json');
        $playlists = [];
        foreach ($files as $file) {
            if (basename($file) !== 'songs-master.json') {
                $playlists[] = basename($file);
            }
        }
        echo json_encode($playlists);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $playlist_name = $data['name'];
    $song_ids = $data['songs'];

    if ($playlist_name && is_array($song_ids)) {
        file_put_contents($public_path . $playlist_name, json_encode($song_ids, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success', 'message' => "Playlist '{$playlist_name}' actualizada."]);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Nombre de playlist o lista de canciones no proporcionada.']);
    }
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $playlist_name = $data['name'];

    if ($playlist_name && file_exists($public_path . $playlist_name)) {
        unlink($public_path . $playlist_name);
        echo json_encode(['status' => 'success', 'message' => "Playlist '{$playlist_name}' eliminada."]);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Archivo de playlist no encontrado.']);
    }
}
?>