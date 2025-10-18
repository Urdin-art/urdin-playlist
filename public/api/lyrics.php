<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$method = $_SERVER['REQUEST_METHOD'];
$lyrics_path = $_SERVER['DOCUMENT_ROOT'] . '/lyrics/';

if ($method === 'GET') {
    $file = $_GET['file'];
    if ($file && file_exists($lyrics_path . $file)) {
        echo file_get_contents($lyrics_path . $file);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Lyrics file not found.']);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $file = $data['file'];
    $content = $data['content'];

    if ($file && $content) {
        file_put_contents($lyrics_path . $file, $content);
        echo json_encode(['status' => 'success', 'message' => "Letra '{$file}' actualizada."]);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Nombre de archivo o contenido no proporcionado.']);
    }
}
?>