import mybatisMapper from 'mybatis-mapper';
import DBPool from '../helper/DBPool.js';
import RuntimeException from '../exceptions/RuntimeException.js';
import bcrypt from 'bcrypt';

class AdminService {
    constructor() {
        mybatisMapper.createMapper([
            './mappers/AdminMapper.xml',
            './mappers/CartMapper.xml'
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

    /** 메뉴 추가 */
    async addItem(params) {
        let dbcon = null;
        let data = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('AdminMapper', 'insertProduct', params);
            let [{affectedRows}] = await dbcon.query(sql);

            if(affectedRows === 0){
                throw new RuntimeException('저장된 데이터가 없습니다.');
            }

            sql = mybatisMapper.getStatement('AdminMapper', 'getProductList', params);
            let [result] = await dbcon.query(sql);
            if(result.length === 0){
                throw new RuntimeException('저장된 데이터를 조회할 수 없습니다.');
            }

            data = result[0];
        } catch (err) {
            throw err;
        } finally {
            if (dbcon) {dbcon.release();}
        }
        return data;
    }



    /** 메뉴 수정 */
    async editItem(params) {
        let dbcon = null;
        let data = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('AdminMapper', 'updateProduct', params);
            let [{affectedRows}] = await dbcon.query(sql);

            if(affectedRows === 0){
                throw new RuntimeException('수정된 데이터가 없습니다.');
            }

            sql = mybatisMapper.getStatement('AdminMapper', 'updateProduct', params);
            let [result] = await dbcon.query(sql);
            if(result.length === 0){
                throw new RuntimeException('저장된 데이터를 조회할 수 없습니다.');
            }

            data = result[0];
        } catch (err) {
            throw err;
        } finally {
            if (dbcon) {dbcon.release();}
        }
        return data;
    }

    /** 메뉴 삭제 */
    async deleteItem(params) {
        let dbcon = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('CartMapper', 'deleteCart', params);
            let [{affectedRows}] = await dbcon.query(sql);

            sql = mybatisMapper.getStatement('AdminMapper', 'deleteProduct', params);
            [{affectedRows}] = await dbcon.query(sql);

            if(affectedRows === 0){
                throw new RuntimeException('삭제된 데이터가 없습니다.');
            }
        } catch (err) {
            throw err;
        } finally {
            if (dbcon) {dbcon.release();}
        }
    }




    /** 주문내역 출력 */
    async getOrderList(params) {
        let dbcon = null;
        let data = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('AdminMapper', 'orderList', params);
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

    async getOrderItem(params) {
        let dbcon = null;
        let data = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('AdminMapper', 'orderItem', params);
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