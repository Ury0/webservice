const express = require('express');
const router = express.Router();
const ModelAccess = require('../model/modelAccess');
const modelAccess = new ModelAccess();  // Instância da classe de modelo

// Rota POST para registrar o acesso
router.post('/access', async (req, res) => {
    console.log("req post /accsess")
    try {
        const { hostname, ip } = req.body;

        // Captura os valores da requisição ou da própria requisição
        const timestamp = new Date().toISOString();  // Formato de timestamp em string
        const host = hostname || req.hostname;
        const clientIp = ip || req.ip;

        // Insere no banco de dados usando o modelo
        await modelAccess.postAccess(timestamp, host, clientIp);

        res.status(201).json({ message: 'Acesso registrado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar o acesso', error });
    }
});

module.exports = router;