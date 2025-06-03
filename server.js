// server.js

// 1. Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// 2. Importar módulos necessários
const express = require('express');
const bcrypt = require('bcryptjs'); // Para hash de senhas
const jwt = require('jsonwebtoken'); // Para JSON Web Tokens
const { Pool } = require('pg'); // Para PostgreSQL (ou 'mysql2' se for MySQL)
const cors = require('cors'); // Para permitir requisições de domínios diferentes (seu frontend)

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// 3. Configurar conexão com o banco de dados
// Se for PostgreSQL:
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Testar conexão com o DB
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados:', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Erro ao executar query de teste:', err.stack);
        }
        console.log('Conectado ao banco de dados PostgreSQL:', result.rows[0].now);
    });
});

// Se for MySQL (exemplo, substitua a parte do PostgreSQL):
/*
const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};
async function connectToDb() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conectado ao banco de dados MySQL.');
        return connection;
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados MySQL:', err.stack);
        process.exit(1); // Encerra a aplicação se não conseguir conectar
    }
}
let dbConnection; // Variável para armazenar a conexão ou pool
connectToDb().then(conn => dbConnection = conn);
*/


// 4. Middlewares do Express
app.use(cors()); // Permite requisições de todos os domínios (para desenvolvimento)
app.use(express.json()); // Permite que o Express parseie bodies de requisição JSON

// --------------------------------------------------------------
// 5. Endpoints de Autenticação e Cadastro
// --------------------------------------------------------------

/**
 * Endpoint de Cadastro de ONG
 * Rota: POST /api/ong/cadastro
 * Body: { email, password, nome_ong, cnpj, ...outros dados da ONG }
 */
app.post('/api/ong/cadastro', async (req, res) => {
    const { email, password, nome_ong, cnpj, ...ongData } = req.body;

    if (!email || !password || !nome_ong || !cnpj) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        // 1. Verificar se o e-mail já existe
        const userExists = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'E-mail já cadastrado.' });
        }

        // 2. Hash da senha
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Inserir na tabela 'usuarios'
        const userResult = await pool.query(
            'INSERT INTO usuarios (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id',
            [email, passwordHash, 'ong']
        );
        const userId = userResult.rows[0].id;

        // 4. Inserir na tabela 'ongs' (usando o userId recém-criado)
        // Certifique-se de que os campos aqui correspondem aos campos da sua tabela 'ongs'
        await pool.query(
            'INSERT INTO ongs (usuario_id, nome_ong, cnpj, descricao) VALUES ($1, $2, $3, $4)',
            [userId, nome_ong, cnpj, ongData.descricao || null] // Exemplo: descricao pode ser opcional
        );

        res.status(201).json({ message: 'ONG cadastrada com sucesso!' });

    } catch (error) {
        console.error('Erro no cadastro de ONG:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar ONG.' });
    }
});

/**
 * Endpoint de Cadastro de Voluntário
 * Rota: POST /api/voluntario/cadastro
 * Body: { email, password, nome_completo, data_nascimento, telefone, ...outros dados do Voluntário }
 */
app.post('/api/voluntario/cadastro', async (req, res) => {
    const { email, password, nome_completo, data_nascimento, telefone, ...voluntarioData } = req.body;

    if (!email || !password || !nome_completo || !data_nascimento || !telefone) {
        return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        // 1. Verificar se o e-mail já existe
        const userExists = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'E-mail já cadastrado.' });
        }

        // 2. Hash da senha
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Inserir na tabela 'usuarios'
        const userResult = await pool.query(
            'INSERT INTO usuarios (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id',
            [email, passwordHash, 'voluntario']
        );
        const userId = userResult.rows[0].id;

        // 4. Inserir na tabela 'voluntarios' (usando o userId recém-criado)
        // Certifique-se de que os campos aqui correspondem aos campos da sua tabela 'voluntarios'
        await pool.query(
            'INSERT INTO voluntarios (usuario_id, nome_completo, data_nascimento, telefone) VALUES ($1, $2, $3, $4)',
            [userId, nome_completo, data_nascimento, telefone]
        );

        res.status(201).json({ message: 'Voluntário cadastrado com sucesso!' });

    } catch (error) {
        console.error('Erro no cadastro de voluntário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar voluntário.' });
    }
});

/**
 * Endpoint de Login
 * Rota: POST /api/login
 * Body: { email, password }
 */
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        // 1. Buscar usuário pelo email
        const userResult = await pool.query('SELECT id, password_hash, user_type FROM usuarios WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 2. Comparar a senha fornecida com o hash armazenado
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 3. Gerar JWT
        // Payload do token pode conter o ID do usuário e o tipo de usuário
        const token = jwt.sign(
            { id: user.id, userType: user.user_type },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.status(200).json({
            message: 'Login realizado com sucesso!',
            token: token,
            userId: user.id,
            userType: user.user_type
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
    }
});


// --------------------------------------------------------------
// 6. Iniciar o servidor
// --------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});