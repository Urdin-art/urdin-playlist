<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Determinar qué recurso se está solicitando
$request_uri = $_SERVER['REQUEST_URI'];
$resource = 'configs'; // Valor por defecto

if (strpos($request_uri, 'songs') !== false) {
    $resource = 'songs';
} elseif (strpos($request_uri, 'playlists') !== false) {
    $resource = 'playlists';
}

// Cargar y ejecutar la lógica del recurso correspondiente
$logic_file = $resource . '.php';

if (file_exists($logic_file)) {
    // Definir las rutas aquí para que los archivos incluidos las puedan usar
    $public_path = '../';
    $master_playlist_path = '../songs-master.json';
    
    // Incluir la lógica del archivo
    include $logic_file;
} else {
    http_response_code(404);
    echo json_encode(['error' => "Resource logic for '{$resource}' not found."]);
}
?>