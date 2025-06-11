<?php
// api/oportunidades.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Restringir em produção para o seu domínio frontend
header('Access-Control-Allow-Methods: POST, GET, OPTIONS'); // GET para buscar, POST para publicar
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Inclui Authorization para tokens

// Inclui o arquivo de conexão com o banco de dados
include_once 'config/database.php'; // Ajuste o caminho conforme a estrutura da sua pasta

// Lógica de autenticação e autorização (EXEMPLO SIMPLIFICADO - ADICIONE SEGURANÇA REAL)
// Em um sistema real, você validaria um token JWT ou verificaria uma sessão aqui
// para obter o $ong_id e garantir que o usuário é uma ONG logada.
function getAuthenticatedOngId($pdo) {
    // Isso é um placeholder! Em produção:
    // 1. Verifique um token JWT no cabeçalho Authorization
    // 2. Ou verifique uma sessão PHP
    // Se o usuário não estiver autenticado ou não for uma ONG, retorne null ou lance um erro.

    // Para fins de teste LOCAL e SIMPLIFICADO:
    // Você pode pegar o ID da ONG de algum lugar (por exemplo, do frontend para teste, MAS NÃO FAÇA ISSO EM PRODUÇÃO)
    // OU DE UMA SESSÃO/TOKEN VALIDADOS.
    // Exemplo Simples com localstorage (NÃO SEGURO PARA PRODUÇÃO SEM VALIDAÇÃO BACKEND):
    // Digamos que o JS envie o ong_id no corpo da requisição junto com os outros dados.
    // $data = json_decode(file_get_contents('php://input'), true);
    // return $data['ong_id'] ?? null;
    
    // Melhor: Obter o ID da ONG de uma sessão validada ou de um JWT
    // Se você usa sessões:
    session_start();
    if (isset($_SESSION['user_id']) && $_SESSION['user_type'] === 'ong') {
        return $_SESSION['user_id'];
    }
    
    // Se você usa JWT, decodifique e valide o token para obter o ID
    // Exemplo:
    // if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    //     $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    //     list($type, $token) = explode(' ', $authHeader);
    //     if ($type == 'Bearer' && $token) {
    //         try {
    //             $decoded = JWT::decode($token, new Key('your_secret_key', 'HS256')); // Use sua chave secreta
    //             if ($decoded->user_type === 'ong') {
    //                 return $decoded->user_id;
    //             }
    //         } catch (Exception $e) {
    //             // Token inválido
    //         }
    //     }
    // }

    return null; // Nenhuma ONG autenticada ou não é uma ONG
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obter o ID da ONG autenticada
    $ong_id = getAuthenticatedOngId($pdo);

    if (!$ong_id) {
        echo json_encode(['success' => false, 'message' => 'Acesso não autorizado. Apenas ONGs logadas podem publicar oportunidades.']);
        http_response_code(401); // Unauthorized
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    $titulo = filter_var($data['titulo'] ?? '', FILTER_SANITIZE_STRING);
    $descricao = filter_var($data['descricao'] ?? '', FILTER_SANITIZE_STRING);
    $requisitos = filter_var($data['requisitos'] ?? '', FILTER_SANITIZE_STRING);
    $data_evento = $data['data_evento'] ?? ''; // Filter_var para data pode ser mais complexo, valide no app
    $local_evento = filter_var($data['local_evento'] ?? '', FILTER_SANITIZE_STRING);

    // Validação básica dos campos obrigatórios
    if (empty($titulo) || empty($descricao) || empty($data_evento) || empty($local_evento)) {
        echo json_encode(['success' => false, 'message' => 'Todos os campos obrigatórios devem ser preenchidos.']);
        exit;
    }

    // Validação de formato de data (opcional, mas recomendado)
    if (!DateTime::createFromFormat('Y-m-d', $data_evento)) {
        echo json_encode(['success' => false, 'message' => 'Formato de data inválido. Use AAAA-MM-DD.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO Oportunidade (ong_id, titulo, descricao, requisitos, data_evento, local_evento) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$ong_id, $titulo, $descricao, $requisitos, $data_evento, $local_evento]);
        
        echo json_encode(['success' => true, 'message' => 'Oportunidade publicada com sucesso!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // --- LÓGICA PARA BUSCAR OPORTUNIDADES (EXPANDIDA COM FILTROS) ---
    $search_term = filter_var($_GET['searchTerm'] ?? '', FILTER_SANITIZE_STRING);
    $filter_location = filter_var($_GET['filterLocation'] ?? '', FILTER_SANITIZE_STRING);
    $filter_date = $_GET['filterDate'] ?? '';

    $sql = "SELECT o.id, o.titulo, o.descricao, o.requisitos, o.data_evento, o.local_evento, n.nome as ong_nome 
            FROM Oportunidade o 
            JOIN ONG n ON o.ong_id = n.id 
            WHERE 1=1"; // Cláusula WHERE inicial para facilitar a adição de condições

    $params = [];

    // Adiciona filtros se existirem
    if (!empty($search_term)) {
        $sql .= " AND (o.titulo LIKE ? OR o.descricao LIKE ? OR n.nome LIKE ?)";
        $params[] = '%' . $search_term . '%';
        $params[] = '%' . $search_term . '%';
        $params[] = '%' . $search_term . '%';
    }
    if (!empty($filter_location)) {
        $sql .= " AND o.local_evento LIKE ?";
        $params[] = '%' . $filter_location . '%';
    }
    if (!empty($filter_date)) {
        // Validação básica da data, para garantir que o formato é compatível com DATE
        if (DateTime::createFromFormat('Y-m-d', $filter_date)) {
            $sql .= " AND o.data_evento = ?";
            $params[] = $filter_date;
        }
    }

    $sql .= " ORDER BY o.data_evento DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $oportunidades = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $oportunidades]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao buscar oportunidades: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
?>
