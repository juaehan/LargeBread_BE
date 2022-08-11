import express from "express";
import productService from "../services/ProductService.js";

const ProductController = () => {
    const url = "/product";
    const router = express.Router();

    router.get(`${url}/:category_id`, async (req, res, next) => {
        const category_id = req.get('category_id');

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