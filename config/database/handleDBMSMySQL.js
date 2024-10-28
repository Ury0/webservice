const fs = require('fs');
const { connect } = require('http2');
const mysql = require('mysql');
const { resolve } = require('path');

class handleDBMSMySQL {
    constructor(host = null, database = null, user = null, password = null) {
        let envFile = JSON.parse(fs.readFileSync('./config/server/env.json', 'utf8', 'r'));
        console.log('Conteúdo de envFile:', envFile);

        if (envFile) {
            this._host = (typeof host !== "string" || host === null) ? envFile.mysql.host : host;
            this._port = (typeof port !== "string" || port === null) ? envFile.mysql.port : port;
            this._database = (typeof database !== "string" || database === null) ? envFile.mysql.database : database;
            this._user = (typeof user !== "string" || user === null) ? envFile.user : user;
            this._password = (typeof password !== "string" || password === null) ? envFile.mysql.password : password;
            this.connect();
        }
    }
    connect() {
        
        this.connection = mysql.createConnection({
            host: this._host,
            port: this._port,
            database: this._database,
            user: this._user,
            password: this._password,
            insecureAuth: true
        });
        console.log(`Conectando a ${this._host}:${this._port}/${this._database} como ${this._user}`);
    }
    query(sql, args) {
        if (this.connection.state === 'disconnected') {
            this.connect();
        }
        return new Promise((resolve, reject) => {
            console.log(`Executando query: ${sql} com argumentos: ${args}`);
            this.connection.query(sql, args, (err, results, fields) => {
                if (err) {
                    console.error('Erro na query:', err); reject(err);
                } else {
                    let resultsJSON = { 'metadata': {}, 'data': {} };
                    if (fields) {
                        resultsJSON.metadata = fields.map((r) => Object.assign({}, r));
                    }
                    if (results) {
                        resultsJSON.data = results.map((r) => Object.assign({}, r));
                    }
                    console.log('Resultados da query:', resultsJSON); resolve(resultsJSON);
                }
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err) {
                    console.error('Erro ao fechar a conexão:', err)
                    reject(err);
                } else {
                    console.log('Conexão fechada com sucesso.');
                    resolve();
                }
            });
        });
    }
}
module.exports = handleDBMSMySQL;