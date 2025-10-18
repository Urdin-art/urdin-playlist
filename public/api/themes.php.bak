<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Para desarrollo

$method = $_SERVER['REQUEST_METHOD'];
$public_path = $_SERVER['DOCUMENT_ROOT'] . '/';

// Endpoint para gestionar temas
if ($method === 'GET') {
    if (isset($_GET['name'])) {
        $theme_path = $public_path . $_GET['name'];
        if (file_exists($theme_path)) {
            echo file_get_contents($theme_path);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Theme file not found.']);
        }
    } else {
        $files = glob($public_path . 'theme-*.json');
        $themes = [];
        foreach ($files as $file) {
            $themes[] = basename($file);
        }
        echo json_encode($themes);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $filename = $data['name'];
    $content = $data['content'];

    if ($filename && $content) {
        file_put_contents($public_path . $filename, json_encode($content, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success', 'message' => "Tema '{$filename}' guardado."]);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Nombre de archivo o contenido no proporcionado.']);
    }
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $filename = $data['name'];

    if ($filename && file_exists($public_path . $filename)) {
        unlink($public_path . $filename);
        echo json_encode(['status' => 'success', 'message' => "Tema '{$filename}' eliminado."]);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Archivo no encontrado.']);
    }
}
?>