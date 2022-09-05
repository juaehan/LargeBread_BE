/**
 * @FileName : FileHelper.js
 * @Description : 파일, 폴더 처리 관련 유틸리티 함수 구현
 * @Author : EZEN 아카데미 Node.js 강의 (이광호, leekh4232@gmail.com)
 */

import fs from 'fs';
import {join, extname} from 'path';
import multer from 'multer';
import thumbnail from 'node-thumbnail';

 
const mkdirs = (target, permission='0755') => {
    // 경로가 없다면 수행하지 않는다.
    if(target == undefined || target == null) {return;}
 
    // 윈도우의 경우 '\'를 '/'로 변환
    target = target.replace(/\\/gi, "/");
 
    const target_list = target.split("/");
 
    // 한 단계씩 생성되는 폴더 깊이를 누적할 변수
    let dir = '';
 
    // 주어진 경로가 절대경로 형식이라면 경로를 누적할 변수를 "/"부터 시작한다
    if(target.substring(0, 1) == "/"){
        dir = "/";
    }
 
    // 윈도우의 경우 하드디스크 문자열을 구분하기 위해 ":"이 포함되어 있다.
    if(target_list[0].indexOf(":") > -1){
        target_list[0] += "/"
    }
 
    // 잘라낸 배열만큼 순환하면서 디렉토리를 생성
    target_list.map((v, i) => {
        dir = join(dir, v);
 
        // 현재 폴더를 의미한다면 이번 턴은 중단
        if(v == "."){
            return;
        }
 
        // console.debug(dir);
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            fs.chmodSync(dir, permission);
        }
    });
};


const initMulter = () => {
    const multipart = multer({
        storage: multer.diskStorage({
            destination: (req, file, callback) => {
                console.group('destination');
                console.debug(file);
                console.groupEnd();

                mkdirs(process.env.UPLOAD_DIR);

                file.upload_dir = process.env.UPLOAD_DIR.replace(/\\/gi, '/');

                callback(null, file.upload_dir);
            },
            filename: (req, file, callback) => {
                console.group('filename');
                console.debug(file);
                console.groupEnd();

                const extName = extname(file.originalname).toLowerCase();
                const saveName = new Date().getTime().toString() + extName;

                file.savename = saveName;
                file.path = join(file.upload_dir, saveName);
                file.url = join(process.env.UPLOAD_URL, saveName).replace(/\\/gi, '/');

                if (req.file instanceof Array) {
                    req.file.push(file);
                } else {
                    req.file = file;
                }

                callback(null, saveName);
            },
        }),
        limits: {
            files: parseInt(process.env.UPLOAD_MAX_COUNT),
            fileSize: parseInt(eval(process.env.UPLOAD_MAX_SIZE))
        },
        fileFilter: (req, file, callback) => {
            console.log("~~~~~~~~~~~~~~~~~");

            const extName = extname(file.originalname).substring(1).toLocaleLowerCase();

            if (process.env.UPLOAD_FILE_FILTER !== undefined) {
                if (process.env.UPLOAD_FILE_FILTER.indexOf(extName) == -1) {
                    const err = new Error();
                    err.result_code = 500;
                    err.result_msg = process.env.UPLOAD_FILE_FILTER.replace("|", ", ") + "형식만 업로드 가능합니다.";

                    return callback(err);
                }
            }
            callback(null, true);
        }
    });

    return multipart;
};

const checkUploadError = err => {
    let result_code = 200;
    let result_msg = 'ok';

    if (err) {
        if (err instanceof multer.MulterError) {
            switch (err.code) {
                case 'LIMIT_FILE_COUNT' :
                    err.result_code = 500;
                    err.result_msg = "업로드 가능한 파일 수를 초과했습니다.";
                    break;

                case 'LIMIT_FILE_SIZE' :
                    err.result_code = 500;
                    err.result_msg = "업로드 가능한 파일 용량을 초과했습니다.";
                    break;

                default :
                    err.result_code = 500;
                    err.result_msg = "알 수 없는 에러가 발생했습니다.";
                    break;
            }
        }
        
        console.error(err);
        result_code = err.result_code;
        result_msg = err.result_msg;
    }

    return {
        result_code : result_code,
        result_msg : result_msg
    };
}

const createThumbnail = file => {
    const size = process.env.THUMB_SIZE.split("|").map((v, i) => parseInt(v));

    size.map(async (v, i) => {
        const thumb_options = {
            source: file.path,
            destination: process.env.THUMB_DIR,
            width: v,
            prefix: 'thumb',
            suffix: '_' + v + 'w',
            override: true
        };

        const basename = file.savename;
        const filename = basename.substring(0, basename.lastIndexOf('.'));
        const thumbname = thumb_options.prefix + filename + thumb_options.suffix + extname(basename);

        if (!file.hasOwnProperty('thumbnail')) {
            file.thumbnail = [];
        }

        const key = v + 'w';
        file.thumbnail[key] = `${process.env.THUMB_URL}/${thumbname}`;

        try {
            await thumbnail.thumb(thumb_options);
        } catch (error) {
            console.error(error);
            throw error;
        }
    });
};

const createThumbnailMultiple = files => {
    files.map((v, i) => createThumbnail(v));
};

export {mkdirs, initMulter, checkUploadError, createThumbnail, createThumbnailMultiple}