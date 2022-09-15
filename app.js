/*----------------------------------------------------------
| 1) 모듈참조
-----------------------------------------------------------*/
import logger from './helper/LogHelper.js';
import {myip, urlFormat} from './helper/UtilHelper.js';
import DBPool from './helper/DBPool.js';
import WebHelper from './helper/WebHelper.js';

import url from 'url';
import path from 'path';

import dotenv from 'dotenv';
import express from 'express';
import useragent from 'express-useragent';
import serveStatic from 'serve-static';
import serveFavicon from 'serve-favicon';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import expressSession from 'express-session';
import cors from 'cors';
import PageNotFoundException from './exceptions/PageNotFoundException.js';

import AdminProductController from './controllers/AdminProductController.js';
import ProductController from './controllers/ProductController.js'
import AdminController from './controllers/AdminController.js';



/*----------------------------------------------------------
| 2) Express 객체 생성
-----------------------------------------------------------*/
const app = express();
const __dirname = path.resolve();
dotenv.config({path: path.join(__dirname, "./config.env")});



/*----------------------------------------------------------
| 3) 클라이언트의 접속시 초기화
-----------------------------------------------------------*/
app.use(useragent.express());

// 접속 감지
app.use((req, res, next) => {
    logger.debug('클라이언트가 접속했습니다.');

    const beginTime = Date.now();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    logger.debug(`[Client] ${ip} / ${req.useragent.os} / ${req.useragent.browser} (${req.useragent.version}) / ${req.useragent.platform}`);

    const current_url = urlFormat({
        protocol: req.protocol,
        host: req.get('host'),
        port: req.port,
        pathname: req.originalUrl
    });

    logger.debug(`[${req.method}] ${decodeURIComponent(current_url)}`);

    res.on('finish', () => {
        const endTime = Date.now();
        const time = endTime - beginTime;

        logger.debug(`클라이언트의 접속이 종료되었습니다. ::: [Runtime] ${time}ms`);
        logger.debug('----------------------------------------------');
    });

    next();
});

// Ctrl+C를 눌렀을때의 이벤트
process.on('SIGINT', () => {
    process.exit();
});

// 프로그램이 종료될 때의 이벤트
process.on('exit', () => {
    DBPool.close();
    logger.info('-------- Server is close -------');
});


/*----------------------------------------------------------
| 4) Express 객체의 추가 설정
-----------------------------------------------------------*/
app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json());

app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_method'));

app.use('/', serveStatic(process.env.PUBLIC_PATH));
app.use(serveFavicon(process.env.FAVICON_PATH));

/** 세션 설정 */
app.use(expressSession({
    secret: process.env.SESSION_ENCRYPT_KEY,
    resave: false,
    saveUninitialized: false
}));

/** 파일 업로드 */
app.use(process.env.UPLOAD_URL, serveStatic(process.env.UPLOAD_DIR));

app.use(WebHelper());



/*----------------------------------------------------------
| 5) 각 URL별 백엔드 기능 정의
-----------------------------------------------------------*/
app.use(AdminProductController());
app.use(ProductController());
app.use(AdminController());

app.use((err, req, res, next) => res.sendError(err));
app.use("*", (req, res, next) => res.sendError(new PageNotFoundException()));


/*----------------------------------------------------------
| 6) 설정한 내용을 기반으로 서버 구동 시작
-----------------------------------------------------------*/
const ip = myip();

app.listen(process.env.PORT, () => {
    logger.debug('----------------------------------------------');
    logger.debug('|            Start Express Server            |');
    logger.debug('----------------------------------------------');

    ip.forEach((v, i) => {
        logger.debug(`Server Address => http://${v}:${process.env.PORT}`);
    });

    logger.debug('----------------------------------------------');
});