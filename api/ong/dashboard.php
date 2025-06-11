<?php
// api/ong/dashboard.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Restringir em produção
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include_once 'config/database.php'; // Ajuste o caminho

// Função de autenticação (reutilizada de oportunidades.php, mas para GET)
function getAuthenticatedOngId($pdo) {
    session_start(); // Inicia a sessão PHP
    if (isset($_SESSION['user_id']) && $_SESSION['user_type'] === 'ong') {
        return $_SESSION['user_id'];
    }
    // Implemente a lógica JWT aqui se estiver usando tokens
    // Exemplo:
    // if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    //     $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    //     list($type, $token) = explode(' ', $authHeader);
    //     if ($type == 'Bearer' && $token) {
    //         try {
    //             $decoded = JWT::decode($token, new Key('your_secret_key', 'HS256'));
    //             if ($decoded->user_type === 'ong') {
    //                 return $decoded->user_id;
    //             }
    //         } catch (Exception $e) {}
    //     }
    // }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $ong_id = getAuthenticatedOngId($pdo);

    if (!$ong_id) {
        echo json_encode(['success' => false, 'message' => 'Acesso não autorizado. ONG não logada.']);
        http_response_code(401); // Unauthorized
        exit;
    }

    $dashboard_data = [
        'totalOpportunities' => 0,
        'newApplications' => 0, // Contagem de candidaturas pendentes
        'totalReviews' => 0,
        'recentOpportunities' => []
    ];

    try {
        // Total de Oportunidades Publicadas
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Oportunidade WHERE ong_id = ?");
        $stmt->execute([$ong_id]);
        $dashboard_data['totalOpportunities'] = $stmt->fetchColumn();

        // Novas Candidaturas (status 'pendente')
        $stmt = $pdo->prepare("
            SELECT COUNT(c.id) 
            FROM Candidatura c
            JOIN Oportunidade o ON c.oportunidade_id = o.id
            WHERE o.ong_id = ? AND c.status = 'pendente'
        ");
        $stmt->execute([$ong_id]);
        $dashboard_data['newApplications'] = $stmt->fetchColumn();

        // Avaliações Recebidas (complexo, pois a avaliação pode ser de voluntário para ONG)
        // Isso assume que o `avaliado_id` na tabela Avaliacao é o ID da ONG quando `tipo` é 'ong'
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Avaliacao WHERE avaliado_id = ? AND tipo = 'ong'");
        $stmt->execute([$ong_id]);
        $dashboard_data['totalReviews'] = $stmt->fetchColumn();

        // Oportunidades Mais Recentes (limite, por exemplo, 5)
        $stmt = $pdo->prepare("SELECT id, titulo, descricao, data_evento, local_evento FROM Oportunidade WHERE ong_id = ? ORDER BY data_evento DESC LIMIT 5");
        $stmt->execute([$ong_id]);
        $dashboard_data['recentOpportunities'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $dashboard_data]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
?>
