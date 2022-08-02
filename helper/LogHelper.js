import dotenv from 'dotenv';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import {join, resolve} from 'path';
import { mkdirs } from './FileHelper.js';

dotenv.config({path: join(resolve(), "./config.env")})

mkdirs(process.env.LOG_PATH);

const {combine, timestamp, printf, splat} = winston.format;

const logger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YY/MM/DD HH:mm:ss SSS'
        }),
        printf((info)=>{
            return `${info.timestamp} [${info.level}]: ${info.message}`;
        }),
        splat()
    ),
    //일반 로그 규칙 정의
    transports: [
        //하루에 하나씩 파일 형태로 기록하기 위한 설정
        new winstonDaily({
            name: 'log',
            level: process.env.LOG_LEVEL,
            datePattern: 'YYMMDD',
            dirname: process.env.LOG_PATH,
            filename: 'log_%DATE%.log',
            maxSize:50000000,
            maxFiles: 50,
            zippedArchive: true
        }),
    ]
});

if(process.env.NODE_ENV !== 'production'){
    logger.add(
        new winston.transports.Console({
            prettyPrint: true,
            showLevel: true,
            level: process.env.LOG_LEVEL,
            format: combine(
                winston.format.colorize(),
                printf((info)=>{
                    return `${info.timestamp} [${info.level}]: ${info.message}`;
                })
            ),
        })
    );
}

export default logger;