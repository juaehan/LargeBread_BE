/*----------------------------------------------------------
| 1) 모듈참조
-----------------------------------------------------------*/
import logger from './helper/LogHelper.js';
import {myip, urlFormat} from './helper/UtilHelper.js';
import {mkdirs, initMulter, checkUploadError, createThumbnail, createThumbnailMultiple} from './helper/FileHelper.js';

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
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json());

app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_method'));

app.use('/', serveStatic(process.env.PUBLIC_PATH));
app.use(serveFavicon(process.env.FAVICON_PATH));


/** 파일 업로드 */
app.use(process.env.UPLOAD_URL, serveStatic(process.env.UPLOAD_DIR));
app.use(process.env.THUMB_URL, serveStatic(process.env.THUMB_DIR));

/** 라우터(URL 분배기) 객체 설정 */
const router = express.Router();
app.use('/', router);



/*----------------------------------------------------------
| 5) 각 URL별 백엔드 기능 정의
-----------------------------------------------------------*/

router.route('/upload/single').post((req, res, next) => {
    const upload = initMulter().single('mymenu');

    upload(req, res, (err) => {
        console.group('request');
        console.debug(req.file);
        console.groupEnd();

        const {result_code, result_msg} = checkUploadError(err);

        if (result_code == 200) {
            try {
                createThumbnail(req.file);
            } catch (error) {
                result_code = 500;
                result_msg = '썸네일 이미지 생성에 실패했습니다.';
            }
        }

        const result = {
            rt: result_code,
            rtmsg: result_msg,
            item: req.file,
        };

        res.status(result_code).send(result);
    });
});

router
    .post('/session/login', (req, res, next) => {
        const id = req.body.userid;
        const pw = req.body.userpw;

        logger.debug('id = ' + id);
        logger.debug('pw = ' + pw);

        let login_ok = false;
        if (id == 'node' && pw == '1234') {
            logger.debug('로그인 성공');
            login_ok = true;
        }

        let result_code = null;
        let result_msg = null;

        if (login_ok) {
            req.session.userid = id;
            req.session.userpw = pw;

            result_code = 200;
            result_msg = 'ok';
        } else {
            result_code = 403;
            result_msg = 'fail';
        }

        const json = {rt: result_msg};
        res.status(result_code).send(json);
    })


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