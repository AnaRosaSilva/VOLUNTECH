<?php
// api/certificados.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Restringir em produção
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include_once '../../config/database.php';

function getAuthenticatedVoluntarioId($pdo) {
    session_start();
    if (isset($_SESSION['user_id']) && $_SESSION['user_type'] === 'voluntario') {
        return $_SESSION['user_id'];
    }
    // Lógica para JWT aqui se estiver usando
    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $voluntario_id = getAuthenticatedVoluntarioId($pdo);

    if (!$voluntario_id) {
        echo json_encode(['success' => false, 'message' => 'Acesso não autorizado. Voluntário não logado.']);
        http_response_code(401);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT c.id, c.titulo, c.descricao, c.data_emissao, c.caminho_arquivo, o.titulo as oportunidade_titulo, n.nome as ong_nome
            FROM Certificado c
            JOIN Oportunidade o ON c.oportunidade_id = o.id
            JOIN ONG n ON o.ong_id = n.id
            WHERE c.voluntario_id = ?
            ORDER BY c.data_emissao DESC
        ");
        $stmt->execute([$voluntario_id]);
        $certificados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $certificados]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao buscar certificados: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
?>
