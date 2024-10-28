const fs = require('fs');
const handleDBMSMySQL = require('../config/database/handleDBMSMySQL');

class modelAccess {
    constructor() {
        this._handleDBMSMySQL = new handleDBMSMySQL();
        this._envFile = JSON.parse(fs.readFileSync('./config/server/env.json', 'utf8', 'r'));
    }

    destroy(param = null) {
        let letToString = letObj => Object.keys(letObj)[0];
        throw new Error(`Parâmetros incorretos para a classe: \`${this.constructor.name}\`, parâmetro \`${letToString({ param })}\``);
    }

    async postAccess(timestamp = null, hostname = null, ip = null) {
        if (typeof timestamp !== 'string' || timestamp === null) this.destroy(timestamp);
        if (typeof hostname !== 'string' || hostname === null) this.destroy(hostname);
        if (typeof ip !== 'string' || ip === null) this.destroy(ip);

        const table = 'access_log';
        const sqlInsert = `INSERT INTO ${this._envFile.database}.${table} (timestamp, hostname, ip) VALUES (?, ?, ?)`;

        try {
            await this._handleDBMSMySQL.query(sqlInsert, [timestamp, hostname, ip]);
        } catch (error) {
            if (error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
                console.error('Erro fatal no protocolo, tentando reconectar...');
                this._handleDBMSMySQL.connect(); // Tenta reconectar
                await this._handleDBMSMySQL.query(sqlInsert, [timestamp, hostname, ip]);
            } else {
                console.error('Erro ao inserir o acesso no banco de dados:', error);
                throw error;
            }
        } finally {
            await this._handleDBMSMySQL.close();
        }
    }
}

module.exports = modelAccess;
