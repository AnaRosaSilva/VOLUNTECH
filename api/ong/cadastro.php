<?php
// api/ong/cadastro.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permitir todas as origens para desenvolvimento. Restringir em produção.
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

include_once 'config/database.php'; // Ajuste o caminho conforme necessário

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $nome = $data['nome'] ?? '';
    $cnpj = $data['cnpj'] ?? '';
    $area_atuacao = $data['area_atuacao'] ?? '';
    $email = $data['email'] ?? '';
    $telefone = $data['telefone'] ?? '';
    $senha = $data['senha'] ?? ''; // Lembre-se de hashar senhas em uma aplicação real!

    if (empty($nome) || empty($cnpj) || empty($email) || empty($senha)) {
        echo json_encode(['success' => false, 'message' => 'Campos obrigatórios ausentes.']);
        exit;
    }

    // Verificar se a ONG com CNPJ ou email já existe
    $stmt = $pdo->prepare("SELECT id FROM ONG WHERE cnpj = ? OR email = ?");
    $stmt->execute([$cnpj, $email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'ONG com este CNPJ ou email já existe.']);
        exit;
    }

    $hashed_password = password_hash($senha, PASSWORD_DEFAULT); // Hash da senha

    try {
        $stmt = $pdo->prepare("INSERT INTO ONG (nome, cnpj, area_atuacao, email, telefone, senha) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$nome, $cnpj, $area_atuacao, $email, $telefone, $hashed_password]);
        echo json_encode(['success' => true, 'message' => 'ONG cadastrada com sucesso!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
?>
