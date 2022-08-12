import express from "express";
import productService from "../services/ProductService.js";

const ProductController = () => {
    const url = "/product";
    const router = express.Router();

    router.get(url, (req, res, next) => {
        let html = "<h1>초기페이지</h1>";
        res.status(200).send(html);
    });

    router.get(`${url}/:category_id`, async (req, res, next) => {
        const category_id = req.get('category_id');
        const url = req.url;
        console.log(url);

        let json = null;
        try{
            json = await productService.getItem({
                category_id: category_id
            });
        } catch (err) {
            return next(err);
        }
        res.sendResult({item: json});
    });

    return router;
};
export default ProductController;