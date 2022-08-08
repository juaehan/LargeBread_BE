import logger from "../helper/LogHelper";
import express from 'express';
import { initMulter, checkUploadError, createThumnail } from "../helper/FileHelper";

export default () => {
    const router = express.Router();
    
    router.route('/upload/single').post((req, res, next) => {
        const upload = initMulter.single('mymenu');

        upload(req, res, (err) => {
            console.group('request');
            console.debug(req.file);
            console.groupEnd();

            let {result_code, result_msg} = checkUploadError(err);

            if(result_code == 200) {
                try{
                    createThumnail(req.file);
                } catch (error) {
                    console.error(error);
                    result_code = 500;
                    result_msg = "썸네일 이미지 생성에 실패했습니다.";
                }
            }

            const result = {
                rt: result_code,
                rtmsg: result_msg,
                item: req.file
            };

            res.status(result_code).send(result);
        });
    });

    return router;
};