// Exemplo de middleware (arquivo: src/middlewares/authMiddleware.js)
const jwt = require('jsonwebtoken');
const config = require('../config/auth'); // Onde você guardaria seu segredo JWT

const authenticateONG = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Espera "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        // req.user agora contém { id: ..., tipo: 'ong'/'voluntario' }
        req.user = decoded; 

        if (req.user.tipo !== 'ong') { // Verifica se é uma ONG
            return res.status(403).json({ message: 'Acesso negado. Apenas ONGs podem realizar esta ação.' });
        }
        next(); // Permite que a requisição continue
    } catch (error) {
        console.error("Erro na verificação do token:", error);
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = authenticateONG;

// Como você usaria no seu arquivo de rotas (ex: src/routes/oportunidades.js)
const express = require('express');
const router = express.Router();
const oportunidadeController = require('../controllers/oportunidadeController');
const authenticateONG = require('../middlewares/authMiddleware'); // Importa o middleware

router.post('/oportunidades', authenticateONG, oportunidadeController.criarOportunidade);
//                                ^^^^^^^^^^^^^^^^^^^ Middleware aqui!

module.exports = router;