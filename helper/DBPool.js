import {join, resolve} from 'path';
import dotenv from 'dotenv';
import mysql2 from 'mysql2/promise';
import logger from './LogHelper.js';

dotenv.config({path: join(resolve(), './config.env')});

class DBPool {
    static current = null;

    static connectionInfo = {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_SCHEMA,
        connectionLimit: process.env.DATABASE_CONNECTION_LIMIT,
        connectTimeout: process.env.DATABASE_CONNECT_TIMEOUT,
        waitForConnections: process.env.DATABASE_WAIT_FOR_CONNECTIONS,
        dateString: 'date'
    };

    static getInstance() {
        if(DBPool.current == null){
            DBPool.current = new DBPool();
        }
        return DBPool.current;
    }

    constructor() {
        this.pool = mysql2.createPool(DBPool.connectionInfo);
        this.pool.on('connection', (connection) => {
            logger.info(` >> DATABASE 접속됨 [threaId=${connection.threadId}]`);

            const oldQuery = connection.query;

            connection.query = function(...args){
                const queryCmd = oldQuery.apply(connection, args);
                logger.debug(queryCmd.sql.trim().replace(/\n/g, " ").replace(/ +(?= )/g, " "));
            }
        });

        this.pool.on('acquire', (connection) => {
            logger.info(` >> Connection 임대됨 [threaId=${connection.threadId}]`);
        });
        this.pool.on('release', (connection) => {
            logger.info(` >> Connection 반납됨 [threaId]=${connection.threadId}`);
        });
    }

    async getConnection() {
        let dbcon = null;

        try{
            dbcon = await this.pool.getConnection();
        } catch (err) {
            if (dbcon) {dbcon.release();}
            logger.error(err);
            throw err;
        }
        return dbcon;
    }

    close(){
        this.pool.end();
    }
}

export default DBPool.getInstance();