<?php
// api/login.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permitir todas as origens para desenvolvimento. Restringir em produção.
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Allow-Headers: Content-Type, Authorization'); // Adicionado Authorization para futura implementação de JWT/Bearer Token

// Inclui o arquivo de conexão com o banco de dados
include_once 'config/database.php'; // Ajuste o caminho conforme a estrutura da sua pasta

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $email = $data['email'] ?? '';
    $senha_digitada = $data['senha'] ?? '';

    if (empty($email) || empty($senha_digitada)) {
        echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios.']);
        exit;
    }

    $usuario_encontrado = null;
    $tipo_usuario = null;

    // 1. Tentar encontrar o usuário na tabela 'Voluntario'
    $stmt_voluntario = $pdo->prepare("SELECT id, nome, senha FROM Voluntario WHERE email = ?");
    $stmt_voluntario->execute([$email]);
    $voluntario = $stmt_voluntario->fetch(PDO::FETCH_ASSOC);

    if ($voluntario) {
        // Verifica a senha para o voluntário
        if (password_verify($senha_digitada, $voluntario['senha'])) {
            $usuario_encontrado = $voluntario;
            $tipo_usuario = 'voluntario';
        }
    }

    // 2. Se não encontrou como voluntário, tentar encontrar na tabela 'ONG'
    if (!$usuario_encontrado) {
        $stmt_ong = $pdo->prepare("SELECT id, nome, senha FROM ONG WHERE email = ?");
        $stmt_ong->execute([$email]);
        $ong = $stmt_ong->fetch(PDO::FETCH_ASSOC);

        if ($ong) {
            // Verifica a senha para a ONG
            if (password_verify($senha_digitada, $ong['senha'])) {
                $usuario_encontrado = $ong;
                $tipo_usuario = 'ong';
            }
        }
    }

    if ($usuario_encontrado) {
        // Login bem-sucedido. Aqui você pode gerar um token JWT ou iniciar uma sessão PHP.
        // Para simplicidade, vamos retornar apenas o tipo de usuário e o ID por enquanto.
        // EM UMA APLICAÇÃO REAL, NÃO RETORNE A SENHA HASHED.
        echo json_encode([
            'success' => true,
            'message' => 'Login bem-sucedido!',
            'user' => [
                'id' => $usuario_encontrado['id'],
                'nome' => $usuario_encontrado['nome'],
                'tipo' => $tipo_usuario
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email ou senha inválidos.']);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
?>
