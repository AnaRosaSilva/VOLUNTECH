<?php 
// api/voluntario/cadastro.php
ini_set('display_errors', 1); // Exibe erros no navegador
ini_set('display_startup_errors', 1); // Exibe erros de inicialização
error_reporting(E_ALL); // Reporta todos os tipos de erros
header('Content-Type: application/json'); // Mantenha este header APÓS os iniset
header('Access-Control-Allow-Origin: *'); 

// api/voluntario/cadastro.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permitir todas as origens para desenvolvimento. Restringir em produção.
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Inclui o arquivo de conexão com o banco de dados
include_once 'config/database.php'; // Ajuste o caminho conforme a estrutura da sua pasta

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decodifica os dados JSON enviados do frontend
    $data = json_decode(file_get_contents('php://input'), true);

    // Coleta os dados do voluntário, usando o operador de coalescência nula para evitar erros se a chave não existir
    $nome = $data['nome'] ?? '';
    $cpf = $data['cpf'] ?? '';
    $habilidades = $data['habilidades'] ?? '';
    $localizacao = $data['localizacao'] ?? '';
    $disponibilidade = $data['disponibilidade'] ?? '';
    $email = $data['email'] ?? '';
    $telefone = $data['telefone'] ?? '';
    $senha = $data['senha'] ?? ''; // Lembre-se de hashar senhas em uma aplicação real!

    // Validação básica dos campos obrigatórios
    if (empty($nome) || empty($cpf) || empty($email) || empty($senha)) {
        echo json_encode(['success' => false, 'message' => 'Campos obrigatórios ausentes.']);
        exit;
    }

    // Verificar se um voluntário com este CPF ou email já existe no banco de dados
    $stmt = $pdo->prepare("SELECT id FROM Voluntario WHERE cpf = ? OR email = ?");
    $stmt->execute([$cpf, $email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Voluntário com este CPF ou email já existe.']);
        exit;
    }

    // Hash da senha antes de armazenar no banco de dados para segurança
    $hashed_password = password_hash($senha, PASSWORD_DEFAULT);

    try {
        // Prepara a consulta SQL para inserir os dados do voluntário
        $stmt = $pdo->prepare("INSERT INTO Voluntario (nome, cpf, habilidades, localizacao, disponibilidade, email, telefone, senha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        // Executa a consulta com os dados fornecidos
        $stmt->execute([$nome, $cpf, $habilidades, $localizacao, $disponibilidade, $email, $telefone, $hashed_password]);
        
        // Retorna uma resposta de sucesso
        echo json_encode(['success' => true, 'message' => 'Voluntário cadastrado com sucesso!']);
    } catch (PDOException $e) {
        // Retorna uma resposta de erro se algo der errado com o banco de dados
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    }

} else {
    // Retorna uma mensagem de erro se o método da requisição não for POST
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
?>
