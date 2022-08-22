import express from "express";
import AdminService from "../services/AdminService.js";

const AdminController = () => {
    const router = express.Router();

    // router.get(`${url}/:category_id`, async (req, res, next) => {
    //     const category_id = req.get('category_id');
    //     const url = req.url;
    //     console.log(url);

    //     let json = null;
    //     try{
    //         json = await productService.getItem({
    //             category_id: category_id
    //         });
    //     } catch (err) {
    //         return next(err);
    //     }
    //     res.sendResult({item: json});
    // });


    router.post("/join", async (req, res, next) => {
        const user_id = req.post('user_id');
        const user_pwd = req.post('user_pwd');
        const user_email = req.post('user_email');

        let json = null;
        try{
            json = await AdminService.addJoin({
                user_id: user_id,
                user_pwd: user_pwd,
                user_email: user_email
            });
        } catch (err) {
            return next(err);
        }
        
        res.sendResult({item: json});
    });


    router.get("/join/:user_id", async (req, res, next) => {
        const user_id = req.get('user_id');

        let json = null;
        try{
            json = await AdminService.findID({
                user_id: user_id,
            });
        } catch (err) {
            return next(err);
        }
        
        res.sendResult({item: json});
    });

    return router;
};
export default AdminController;