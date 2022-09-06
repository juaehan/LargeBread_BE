import express from 'express';
import { initMulter, checkUploadError, createThumbnail, createThumbnailMultiple } from "../helper/FileHelper.js";
import MultipartException from '../exceptions/MultipartException.js';
import AdminService from '../services/AdminService.js';
import regexHelper from '../helper/RegexHelper.js';

export default () => {
    const router = express.Router();
    const url = '/admin/product';

    router.get('/admin/order_list', async (req, res, next) => {
        const query = req.get('query');

        const params = {};
        if(query){
            params.date = query;
        }
        console.log("params = " +params.date);
        let json = null;

        try{
            json = await AdminService.getOrderList(params);
        }catch (err) {
            return next(err);
        }

        res.sendResult({item: json});
    });


    router.post('/admin/product/product_add', async (req, res, next) => {
        const upload = initMulter().single('img_url');

        await upload(req, res, (err) => {
            const product_name = req.post('product_name');
            const price = req.post('price');
            const product_state = req.post('product_state');
            const cost = req.post('cost');
            const category_id = req.post('category_id');

            if(err) {
                return next(new MultipartException(err));
            }

            try{
                regexHelper.check(category_id, '카테고리를 선택해주세요.');
                regexHelper.check(product_state, '상품상태를 선택해주세요.');
                regexHelper.value(product_name, '상품명을 입력해주세요.');
                regexHelper.value(price, '가격을 입력해주세요.');
                regexHelper.value(cost, '원가를 입력해주세요.');
            }catch(err){
                return next(err);
            }

            let json = null;

            try{
                json = AdminService.addItem({
                    product_name: product_name,
                    price: price,
                    img_url: './upload/' + req.file.filename,
                    product_state: product_state,
                    cost: cost,
                    category_id: category_id
                });
                
            } catch (error) {
                return next(error);
            }
            res.sendResult({item: json});
        });
    });


    router.get(url, async (req, res, next) => {
        let json = null;

        try{
            json = await AdminService.getProductList();
        }catch (err) {
            return next(err);
        }
        res.sendResult({item: json});
    });


    router.delete(`${url}/:id`, async (req, res, next) => {
        const product_name = req.get('product_name');
        const id = req.get('id');
        console.log(id);
        
        try{
            await AdminService.deleteItem({
                id: id,
                product_id: id
            });
        }catch (err) {
            return next(err);
        }
        res.sendResult();
    });


    router.put('/admin/product/product_edit/:id', async (req, res, next) => {
        const id = req.get('id');
        const product_name = req.post('product_name');
        const price = req.post('price');
        const product_state = req.post('product_state');
        const cost = req.post('cost');
        const category_id = req.post('category_id');

        try{
            regexHelper.check(category_id, '카테고리를 선택해주세요.');
            regexHelper.check(product_state, '상품상태를 선택해주세요.');
            regexHelper.value(product_name, '상품명을 입력해주세요.');
            regexHelper.value(price, '가격을 입력해주세요.');
            regexHelper.value(cost, '원가를 입력해주세요.');
        }catch(err){
            return next(err);
        }

        let json = null;
        try{
            json = await AdminService.editItem({
                id: id,
                product_name : product_name,
                price : price,
                product_state : product_state,
                cost : cost,
                category_id : category_id
            });
        }catch (err) {
            return next(err);
        }
        res.sendResult({item: json});
    });

    return router;
};