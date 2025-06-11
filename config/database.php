<?php
// config/database.php
$host = 'localhost'; // Seu host do banco de dados
$dbname = 'voluntech'; // Seu nome do banco de dados
$username = 'root'; // Seu nome de usuário do banco de dados
$password = ''; // Sua senha do banco de dados

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Conexão com o banco de dados bem-sucedida!"; // Para teste
} catch (PDOException $e) {
    die("Conexão com o banco de dados falhou: " . $e->getMessage());
}
?>
