import express from "express";
import AdminService from "../services/AdminService.js";
import bcrypt from 'bcrypt';
import regexHelper from "../helper/RegexHelper.js";
import logger from "../helper/LogHelper.js";
import BadRequestException from "../exceptions/BadRequestException.js";


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
        } catch (err) {
            return next(err);
        }
        res.sendResult({item: json});
        
    });


    /** 로그인 */
    router
        .post("/", async (req, res, next) => {
            const id = req.post('user_email');
            const pw = req.post('user_pw');

            logger.debug('id= '+ id);
            logger.debug('pw= '+ pw);

            let json = null;

            try{
                json = await AdminService.login({
                    user_pw: pw, 
                    user_email: id
                })
                if(id != user_email || pw != user_pw){
                    const error = new BadRequestException('아이디나 비밀번호를 확인하세요.');
                    return next(error);
                }
            }catch (err) {
                return next(err);
            }
            req.session.user_email = id;
            req.session.user_pw = pw;
            res.sendResult();
        });

    return router;
};
export default AdminController;