const fs = require('fs');
const { connect } = require('http2');
const mysql = require('mysql');
const { resolve } = require('path');

class handleDBMSMySQL {
    constructor (host=null,database=null,user=null,password=null){
        let envFile = JSON.parse(fs.readFileSync('./config/server/env.json','utf8','r'));

        if(envFile){
            this._host = (typeof host !== "string" || host === null) ? envFile.host : host;
            this._database = (typeof database !== "string" || database === null) ? envFile.database : database;
            this._user = (typeof user !== "string" || user === null) ? envFile.user : user;
            this._password = (typeof password !== "string" || password === null) ? envFile.password : password;
            this.connect();
        }
    }
    connect(){
        this.connection = mysql.createConnection({
            host: this._host,
            database: this._database,
            user: this._user,
            password: this._password
        });
    }
    query(sql, args){
        return new Promise ((resolve, reject) =>{
            this.connection.query(sql, args, (err, results, fields)=>{
                if(err){
                    reject(err);
                } else {
                    let resultsJSON = {'metadata': {}, 'data': {}};
                    resultsJSON.metadata = fields.map((r) => Object.assign({}, r));
                    resultsJSON.data = results.map((r) => Object.assign({}, r));
                    resolve(resultsJSON);
                }
            });
        });
    }
    close(){
        return new Promise((resolve, reject)=>{
            this.connection.end(err =>{
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        });
    }
}
module.exports = handleDBMSMySQL;