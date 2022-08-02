/*----------------------------------------------------------
| 1) 모듈참조
-----------------------------------------------------------*/
import logger from './helper/LogHelper.js';
import {myip, urlFormat} from './helper/UtilHelper.js';

import url from 'url';
import path from 'path';

import dotenv from 'dotenv';
import express from 'express';
import useragent from 'express-useragent';
import serveStatic from 'serve-static';
import serveFavicon from 'serve-favicon';



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



/*----------------------------------------------------------
| 4) Express 객체의 추가 설정
-----------------------------------------------------------*/
app.use('/', serveStatic(process.env.PUBLIC_PATH));
app.use(serveFavicon(process.env.FAVICON_PATH));

/** 라우터(URL 분배기) 객체 설정 */
const router = express.Router();
app.use('/', router);



/*----------------------------------------------------------
| 5) 각 URL별 백엔드 기능 정의
-----------------------------------------------------------*/
router.get('/page1', (req, res, next) => {
    let html = '<h1>page1 테스트 화면입니다.</h1>'
    html += '<h2>Node.js 페이지</h2>'

    res.status(200).send(html);
});

router.get('/page2', (req, res, next) => {
    res.redirect('https://www.naver.com');
});



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