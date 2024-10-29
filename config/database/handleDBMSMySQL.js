const fs = require('fs');
const mysql = require('mysql');

class handleDBMSMySQL {
    constructor(host = null, port = null, database = null, user = null, password = null) {
        try {
            const envFile = JSON.parse(fs.readFileSync('./config/server/env.json', 'utf8'));
            console.log('Conteúdo de envFile:', envFile);
            if (envFile && envFile.mysql) {
                this._host = host || envFile.mysql.host;
                this._port = port || envFile.mysql.port;
                this._database = database || envFile.mysql.database;
                this._user = user || envFile.mysql.user;
                this._password = password || envFile.mysql.password;
                this.connect();
            } else {
                throw new Error('Arquivo env.json não está configurado corretamente.');
            }
        } catch (error) {
            console.error('Erro ao carregar o arquivo env.json:', error);
            throw error;
        }
    }

    connect() {
        console.log(`Conectando a ${this._host}:${this._port}/${this._database} como ${this._user}`);
        this.connection = mysql.createConnection({
            host: this._host,
            port: this._port,
            database: this._database,
            user: this._user,
            password: this._password,
            insecureAuth: true  // Adicione esta linha para ajudar com a autenticação
        });

        this.connection.connect(err => {
            if (err) {
                console.error('Erro ao conectar ao banco de dados:', err);
                throw err;
            }
            console.log('Conectado ao banco de dados MySQL!');
        });
    }

    query(sql, args) {
        if (this.connection.state === 'disconnected') {
            this.connect();
        }
        return new Promise((resolve, reject) => {
            console.log(`Executando query: ${sql} com argumentos: ${args}`);
            this.connection.query(sql, args, (err, results, fields) => {
                if (err) {
                    console.error('Erro na query:', err);
                    if (err.fatal) {
                        console.log('Erro fatal, tentando reconectar...');
                        this.connect();
                        this.connection.query(sql, args, (err2, results2, fields2) => {
                            if (err2) {
                                console.error('Erro na query após reconectar:', err2);
                                reject(err2);
                            } else {
                                resolve({ results: results2, fields: fields2 });
                            }
                        });
                    } else {
                        reject(err);
                    }
                } else {
                    resolve({ results, fields });
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.connection && this.connection.state !== 'disconnected') {
                this.connection.end(err => {
                    if (err) {
                        console.error('Erro ao fechar a conexão:', err);
                        reject(err);
                    } else {
                        console.log('Conexão fechada com sucesso.');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = handleDBMSMySQL;
