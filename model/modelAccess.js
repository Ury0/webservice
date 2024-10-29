const fs = require('fs');
const handleDBMSMySQL = require('../config/database/handleDBMSMySQL');

class ModelAccess {
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
        
        const database = this._envFile.mysql.database; // Certifique-se de que está pegando o database corretamente
        const table = 'access';
        const sqlInsert = `INSERT INTO ${database}.${table} (timestamp, hostname, ip) VALUES (?, ?, ?)`;
        
        try {
            await this._handleDBMSMySQL.query(sqlInsert, [timestamp, hostname, ip]);
        } catch (error) {
            console.error('Erro ao inserir o acesso no banco de dados:', error);
            throw error;
        } finally {
            await this._handleDBMSMySQL.close().catch((err) => console.error('Erro ao fechar a conexão:', err));
        }
    }
    async getAccess(id) { 
        const database = this._envFile.mysql.database; 
        const sql = `SELECT * FROM ${database}.access WHERE id = ?`; 
        try { 
            const result = await this._handleDBMSMySQL.query(sql, [id]); 
            return result.data; 
        } catch (error) { 
            throw error; 
        } 
    }
}


module.exports = ModelAccess;
