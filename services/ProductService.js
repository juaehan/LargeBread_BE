import mybatisMapper from 'mybatis-mapper';
import DBPool from '../helper/DBPool.js';
import RuntimeException from '../exceptions/RuntimeException.js';

class ProductService {
    constructor() {
        mybatisMapper.createMapper([
            './mappers/ProductMapper.xml',
            './mappers/CartMapper.xml'
        ]);
    }
    
    /** 메뉴 출력*/
    async getItem(params) {
        let dbcon = null;
        let data = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('ProductMapper', 'selectItem', params);
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

    
    /** 주문내역 담기*/
    async addCart(params) {
        let dbcon = null;
        let data = null;

        try{
            dbcon = await DBPool.getConnection();

            let sql = mybatisMapper.getStatement('CartMapper', 'insertCart', params);
            let [result] = await dbcon.query(sql);

            if(result.length === 0){
                throw new RuntimeException('저장된 데이터가 없습니다.');
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

export default new ProductService();