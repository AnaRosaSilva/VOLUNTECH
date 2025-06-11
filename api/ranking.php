<?php
// api/ranking.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Pode ser público
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Ranking baseado no número de certificados emitidos por voluntário
        $stmt = $pdo->prepare("
            SELECT 
                v.id as voluntario_id,
                v.nome as voluntario_nome,
                COUNT(DISTINCT c.id) as atividades_concluidas,
                COUNT(DISTINCT o.ong_id) as ongs_ajudadas
            FROM Voluntario v
            JOIN Certificado c ON v.id = c.voluntario_id
            JOIN Oportunidade o ON c.oportunidade_id = o.id
            GROUP BY v.id, v.nome
            ORDER BY atividades_concluidas DESC, ongs_ajudadas DESC
            LIMIT 10 -- Top 10 voluntários
        ");
        $stmt->execute();
        $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $ranking]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao buscar ranking: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
?>
