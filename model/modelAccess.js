const fs = require('fs');
const handleDBMSMySQL = require('../config/database/handleDBMSMySQL');

class modelAccess {
    constructor() {
        this._handleDBMSMySQL = new handleDBMSMySQL();
        this._envFile = JSON.parse(fs.readFileSync('./config/server/env.json', 'utf8', 'r'));
    }

    // Método para lidar com parâmetros inválidos
    destroy(param = null) {
        let letToString = letObj => Object.keys(letObj)[0];
        throw new Error(`Parâmetros incorretos para a classe: \`${this.constructor.name}\`, parâmetro \`${letToString({ param })}\``);
    }

    // Método para registrar o acesso no banco de dados
    async postAccess(timestamp = null, hostname = null, ip = null) {
        // Validações de parâmetros
        if (typeof timestamp !== 'string' || timestamp === null) this.destroy(timestamp);
        if (typeof hostname !== 'string' || hostname === null) this.destroy(hostname);
        if (typeof ip !== 'string' || ip === null) this.destroy(ip);

        const table = 'access_log';  // Nome da tabela de acessos (assumindo que seja "access_log")
        const sqlInsert = `INSERT INTO ${this._envFile.database}.${table} (timestamp, hostname, ip) VALUES (?, ?, ?)`;

        try {
            // Executa a query com proteção contra SQL injection
            await this._handleDBMSMySQL.query(sqlInsert, [timestamp, hostname, ip]);
        } catch (error) {
            console.error('Erro ao inserir o acesso no banco de dados:', error);
            throw error;
        } finally {
            // Fecha a conexão
            await this._handleDBMSMySQL.close();
        }
    }
}

module.exports = modelAccess;
