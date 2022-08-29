import express from "express";
import AdminService from "../services/AdminService.js";
import bcrypt from 'bcrypt';


const AdminController = () => {
    const router = express.Router();

    router.post("/join", (req, res, next) => {
        const name = req.post('name');
        const user_pwd = req.post('user_pwd');
        const user_email = req.post('user_email');
        const confirmPwd = req.body.confirmPwd;
        const hash = bcrypt.hashSync(user_pwd, 8);

        let json = null;
        
        try{
            if(user_pwd == confirmPwd){
                json = AdminService.addJoin({
                    name: name,
                    user_pwd: hash,
                    user_email: user_email
                });
            }else{
                res.json({rtmsg: '비밀번호가 일치하지 않습니다.'});
                return;
            }
            
        } catch (err) {
            return next(err);
        }
        res.sendResult({item: json});
    });
    return router;
};
export default AdminController;