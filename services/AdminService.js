import mybatisMapper from 'mybatis-mapper';
import DBPool from '../helper/DBPool.js';
import RuntimeException from '../exceptions/RuntimeException.js';
import bcrypt from 'bcrypt';

class AdminService {
    constructor() {
        mybatisMapper.createMapper([
            './mappers/JoinMapper.xml'
        ]);
    }
    
    /** 회원가입 */
    async register(params) {
        let dbcon = null;
        let data = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('JoinMapper', 'insertAdmin', params);
            let [result] = await dbcon.query(sql);

            if(result.length === 0) {
                throw new RuntimeException('저장된 데이터가 없습니다.');
            }
            console.log('result: '+JSON.stringify(result));
            data = result[0];
        } catch (err) {
            throw err;
        } finally {
            if (dbcon) {dbcon.release();}
        }
        return data;
    }


    /** 로그인 */
    async login(params){
        let dbcon = null;
        let data = null;

        try {
            dbcon = await DBPool.getConnection();
            let sql = mybatisMapper.getStatement('JoinMapper', 'login', params);
            let [result] = await dbcon.query(sql, params[0], (err, row) => {
                if(err) console.log(err);
                if(row.length > 0){
                    bcrypt.compare(param[1], row[0].params.pw, (error, result) => {
                        if(result){
                            req.session.id = params.id
                        }else{
                            //실패
                        }
                    })
                }else{
                    console.log('ID가 존재하지 않아');
                }
            });

            data = result;
        }catch (err) {
            throw err;
        }finally {
            if (dbcon) {dbcon.release();}
        }
        return data;
    }
}

export default new AdminService();