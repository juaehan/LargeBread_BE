import express from 'express';
import { initMulter, checkUploadError, createThumbnail, createThumbnailMultiple } from "../helper/FileHelper.js";
import MultipartException from '../exceptions/MultipartException.js';
import AdminService from '../services/AdminService.js';

export default () => {
    const router = express.Router();

    router.post('/product_add', async (req, res, next) => {
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


    router.get('/admin/product', async (req, res, next) => {
        let json = null;

        try{
            json = await AdminService.getProductList();
        }catch (err) {
            return next(err);
        }
        res.sendResult({item: json});
    });

    return router;
};