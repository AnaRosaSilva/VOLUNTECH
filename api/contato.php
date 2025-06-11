<?php
// api/contato.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permitir todas as origens para desenvolvimento. Restringir em produção.
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir o autoloader do Composer - ESSENCIAL!
require '../../vendor/autoload.php'; // Verifique se o caminho está correto para sua estrutura de pastas

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception; // Importa a classe Exception do PHPMailer

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Resposta pré-voo (preflight) para requisições OPTIONS
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $nome = filter_var($data['nome'] ?? '', FILTER_SANITIZE_STRING);
    $email_remetente = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $assunto = filter_var($data['assunto'] ?? '', FILTER_SANITIZE_STRING);
    $mensagem = filter_var($data['mensagem'] ?? '', FILTER_SANITIZE_STRING);

    // Endereço de e-mail para onde as mensagens serão enviadas
    $email_destino = 'ana.r.santos@mt.estudante.senai.br'; // CORRIJA O ERRO DE DIGITAÇÃO AQUI: "estudante"

    // Validação básica
    if (empty($nome) || empty($email_remetente) || empty($assunto) || empty($mensagem)) {
        echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']);
        exit;
    }

    if (!filter_var($email_remetente, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Formato de e-mail inválido.']);
        exit;
    }

    // Instanciar PHPMailer
    $mail = new PHPMailer(true); // Passe `true` para habilitar exceções

    try {
        // Configurações do Servidor SMTP
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'contatovoluntech@gmail.com';
        $mail->Password   = 'bxdl yrxg vbmy cdbh '; // **REFORÇANDO: ISSO DEVE SER UMA SENHA DE APLICATIVO DO GMAIL!**
                                          // Se for a senha normal da sua conta, NÃO VAI FUNCIONAR.
                                          // Vá em "Segurança" da sua conta Google -> "Verificação em duas etapas" -> "Senhas de app".
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Para porta 465 (SSL)
        $mail->Port       = 465; // Porta SMTP
        $mail->CharSet    = 'UTF-8'; // Garante que acentos e caracteres especiais funcionem

        // Remetente e Destinatário
        $mail->setFrom('contatovoluntech@gmail.com', 'VolunTech Contato');
        $mail->addAddress($email_destino); // Use a variável $email_destino
        $mail->addReplyTo($email_remetente, $nome);

        // Conteúdo do E-mail
        $mail->isHTML(true);
        $mail->Subject = 'Nova Mensagem de Contato VolunTech: ' . $assunto;
        $mail->Body    = "
            <h3>Nova Mensagem do Formulário de Contato VolunTech</h3>
            <p><strong>Nome:</strong> {$nome}</p>
            <p><strong>E-mail:</strong> {$email_remetente}</p>
            <p><strong>Assunto:</strong> {$assunto}</p>
            <p><strong>Mensagem:</strong></p>
            <p>{$mensagem}</p>
            <br>
            <small>Esta mensagem foi enviada via formulário de contato do VolunTech.</small>
        ";
        $mail->AltBody = "Nova Mensagem do Formulário de Contato VolunTech\n\nNome: {$nome}\nE-mail: {$email_remetente}\nAssunto: {$assunto}\nMensagem:\n{$mensagem}";

        $mail->send();
        echo json_encode(['success' => true, 'message' => 'Mensagem enviada com sucesso! Em breve entraremos em contato.']);
    } catch (Exception $e) {
        error_log("Erro ao enviar e-mail: " . $e->getMessage() . " PHPMailer Error: " . $mail->ErrorInfo);
        echo json_encode(['success' => false, 'message' => 'Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente mais tarde.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido.']);
}
?>
