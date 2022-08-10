import express from 'express';
import { initMulter, checkUploadError, createThumbnail, createThumbnailMultiple } from "../helper/FileHelper.js";
import MultipartException from '../exceptions/MultipartException.js';
import productService from "../services/ProductService.js";

export default () => {
    const router = express.Router();
    const url = '/upload/single';

    router.post(url, async (req, res, next) => {
        const upload = initMulter().single('mymenu');

        await upload(req, res, (err) => {
            if(err) {
                return next(new MultipartException(err));
            }

            let json = null;
            try{
                json = productService.addItem({
                    img_url: './upload/' + req.file.filename
                });
            } catch (error) {
                return next(error);
            }

            res.sendResult(req.file);
        });
    });

    return router;
};