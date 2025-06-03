<?php
// File: php-backend/public/index.php

require __DIR__ . '/../vendor/autoload.php';

use Firebase\Auth\Token\Verifier;
use Firebase\Auth\Token\InvalidToken;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

header("Content-Type: application/json");

$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

$input = json_decode(file_get_contents("php://input"), true);
$token = $input['idToken'] ?? '';

function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

try {
    $verifier = new Verifier($_ENV['FIREBASE_PROJECT_ID']);
    $verifiedIdToken = $verifier->verifyIdToken($token);
    $uid = $verifiedIdToken->getClaim('sub');
    $email = $verifiedIdToken->getClaim('email');
} catch (InvalidToken $e) {
    respond(['error' => 'Token inválido.'], 401);
} catch (Exception $e) {
    respond(['error' => 'Erro no servidor: ' . $e->getMessage()], 500);
}

switch ($requestUri) {
    case '/login':
        if ($method !== 'POST') respond(['error' => 'Método não permitido.'], 405);

        respond([
            'status' => 'success',
            'uid' => $uid,
            'email' => $email
        ]);

    case '/reauth':
        if ($method !== 'POST') respond(['error' => 'Método não permitido.'], 405);

        $authTime = $verifiedIdToken->getClaim('auth_time');
        $now = time();

        if (($now - $authTime) > 300) {
            respond(['error' => 'Reautenticação exigida.'], 401);
        }

        respond(['status' => 'reauthenticated']);

    case '/profile':
        if ($method !== 'GET') respond(['error' => 'Método não permitido.'], 405);

        respond([
            'uid' => $uid,
            'email' => $email,
            'claims' => $verifiedIdToken->claims()
        ]);

    case '/logout':
        if ($method !== 'POST') respond(['error' => 'Método não permitido.'], 405);

        respond(['status' => 'logout fake: o token é stateless']);

    default:
        respond(['error' => 'Rota não encontrada.'], 404);
}
