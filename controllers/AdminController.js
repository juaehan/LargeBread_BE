import express from "express";
import AdminService from "../services/AdminService.js";
import bcrypt from 'bcrypt';
import regexHelper from "../helper/RegexHelper.js";
import logger from "../helper/LogHelper.js";


const AdminController = () => {
    const router = express.Router();

    /** 회원가입 */
    router.post("/signup", (req, res, next) => {
        const name = req.post('name');
        const user_pw = req.post('user_pw');
        const user_email = req.post('user_email');
        const confirmPw = req.post('confirmPw');
        const hash = bcrypt.hashSync(user_pw, 8);

        try{
            regexHelper.value(name, '이름을 입력해주세요.');
            regexHelper.kor(name, '이름은 한글만 입력 가능합니다.');
            regexHelper.value(user_pw, '비밀번호를 입력해주세요.');
            regexHelper.value(confirmPw, '비밀번호를 입력해주세요.');
            regexHelper.engNum(user_pw, '문자와 숫자만 입력 가능합니다.');
            regexHelper.maxLength(user_pw, 15, '최대 15글자만 입력 가능합니다.');
            regexHelper.minLength(user_pw, 6, '최소 6글자 이상 입력해주세요.');
            regexHelper.value(user_email, '이메일을 입력해주세요.');
        } catch (err) {
            return next(err);
        }

        let json = null;
        
        try{
            if(user_pw == confirmPw){
                json = AdminService.register({
                    name: name,
                    user_pw: hash,
                    user_email: user_email
                });
            }
            console.log('결과: ' + AdminController.register);
            console.log('결과: ' + json.result);
        } catch (err) {
            return next(err);
        }
        console.log('json: '+json.name);
        res.sendResult({item: json});
        
    });


    /** 로그인 */
    router
        .post("/", (req, res, next) => {
            
        })

    return router;
};
export default AdminController;