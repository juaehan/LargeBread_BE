import mybatisMapper from 'mybatis-mapper';
import DBPool from '../helper/DBPool.js';
import RuntimeException from '../exceptions/RuntimeException.js';
import bcrypt from 'bcrypt';

class AdminService {
    constructor() {
        mybatisMapper.createMapper([
            './mappers/AdminMapper.xml'
        ]);
    }
    
    /** 회원가입 */
    async register(params) {
        let dbcon = null;
        let data = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('AdminMapper', 'insertAdmin', params);
            let [result] = await dbcon.query(sql);

            if(result.length === 0) {
                throw new RuntimeException('저장된 데이터가 없습니다.');
            }
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

            let sql = mybatisMapper.getStatement('AdminMapper', 'login', params);
            let [result] = await dbcon.query(sql);

            if(result.length === 0){
                throw new RuntimeException('조회된 데이터가 없습니다.');
            }

            data = result[0];
        }catch (err) {
            throw err;
        }finally {
            if (dbcon) {dbcon.release();}
        }
        return data;
    }


    /** 관리자 - 상품관리 출력 */
    async getProductList(params) {
        let dbcon = null;
        let data = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('AdminMapper', 'getProductList', params);
            let [result] = await dbcon.query(sql);

            if(result.length === 0){
                throw new RuntimeException('조회된 데이터가 없습니다.');
            }

            data = result;
        } catch (err) {
            throw err;
        } finally {
            if (dbcon) {dbcon.release();}
        }
        return data;
    }
}

export default new AdminService();