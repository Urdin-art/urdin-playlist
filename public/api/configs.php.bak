<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permitir acceso desde cualquier origen (para desarrollo)

// NOTA: En un entorno de producción, deberías restringir el origen a la URL de tu panel de administración.
// header('Access-Control-Allow-Origin: http://localhost:5173');

$method = $_SERVER['REQUEST_METHOD'];
$public_path = $_SERVER['DOCUMENT_ROOT'] . '/';

// Endpoint para obtener la lista de archivos de configuración
if ($method === 'GET') {
    if (isset($_GET['list_themes'])) {
        $theme_files = glob($public_path . 'theme-*.json');
        $themes = [];
        foreach ($theme_files as $file) {
            $themes[] = str_replace(['theme-', '.json'], '', basename($file));
        }
        echo json_encode($themes);
        return;
    }

    if (isset($_GET['name'])) {
        $config_path = $public_path . $_GET['name'];
        if (file_exists($config_path)) {
            echo file_get_contents($config_path);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Config file not found.']);
        }
    } else {
        $files = glob($public_path . '/*-side.json');
        $configs = [];
        foreach ($files as $file) {
            $configs[] = basename($file);
        }
        echo json_encode($configs);
    }
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $filename = $data['name'];

    if ($filename && file_exists($public_path . $filename)) {
        unlink($public_path . $filename);
        echo json_encode(['status' => 'success', 'message' => "Configuración '{$filename}' eliminada."]);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Archivo no encontrado.']);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $filename = $data['name'];
    $content = $data['content'];

    if ($filename && $content) {
        file_put_contents($public_path . $filename, json_encode($content, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success', 'message' => "Configuración '{$filename}' creada/actualizada."]);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Nombre de archivo o contenido no proporcionado.']);
    }
}
?>