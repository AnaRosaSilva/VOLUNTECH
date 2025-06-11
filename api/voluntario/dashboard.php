<?php
// api/voluntario/dashboard.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Restringir em produção
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include_once 'config/database.php'; // Ajuste o caminho

// Função de autenticação para voluntário
function getAuthenticatedVoluntarioId($pdo) {
    session_start(); // Inicia a sessão PHP
    if (isset($_SESSION['user_id']) && $_SESSION['user_type'] === 'voluntario') {
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
    //             if ($decoded->user_type === 'voluntario') {
    //                 return $decoded->user_id;
    //             }
    //         } catch (Exception $e) {}
    //     }
    // }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $voluntario_id = getAuthenticatedVoluntarioId($pdo);

    if (!$voluntario_id) {
        echo json_encode(['success' => false, 'message' => 'Acesso não autorizado. Voluntário não logado.']);
        http_response_code(401); // Unauthorized
        exit;
    }

    $dashboard_data = [
        'pendingApplications' => 0,
        'approvedApplications' => 0,
        'availableCertificates' => 0,
        'recommendedOpportunities' => []
    ];

    try {
        // Contagem de Candidaturas Pendentes
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Candidatura WHERE voluntario_id = ? AND status = 'pendente'");
        $stmt->execute([$voluntario_id]);
        $dashboard_data['pendingApplications'] = $stmt->fetchColumn();

        // Contagem de Candidaturas Aprovadas
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Candidatura WHERE voluntario_id = ? AND status = 'aprovada'");
        $stmt->execute([$voluntario_id]);
        $dashboard_data['approvedApplications'] = $stmt->fetchColumn();

        // Contagem de Certificados Disponíveis (Assumindo uma tabela Certificado ou um campo em Candidatura)
        // Se você tiver uma tabela Certificado:
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM Certificado WHERE voluntario_id = ?");
        $stmt->execute([$voluntario_id]);
        $dashboard_data['availableCertificates'] = $stmt->fetchColumn();
        // Se você não tiver uma tabela Certificado ainda, pode comentar a linha acima
        // e definir um valor padrão para 'availableCertificates' ou adaptar de Candidatura,
        // por exemplo, candidaturas concluídas com sucesso.

        // Oportunidades Recomendadas (Exemplo: 3 oportunidades mais recentes que não foram aplicadas pelo voluntário)
        $stmt = $pdo->prepare("
            SELECT o.id, o.titulo, o.descricao, o.local_evento, o.data_evento, n.nome as ong_nome
            FROM Oportunidade o
            JOIN ONG n ON o.ong_id = n.id
            LEFT JOIN Candidatura c ON o.id = c.oportunidade_id AND c.voluntario_id = ?
            WHERE c.id IS NULL AND o.data_evento >= CURDATE() -- Onde o voluntário não se candidatou e a data é futura
            ORDER BY o.data_publicacao DESC
            LIMIT 3
        ");
        $stmt->execute([$voluntario_id]);
        $dashboard_data['recommendedOpportunities'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $dashboard_data]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
?>
