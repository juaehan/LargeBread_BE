/**
 * @filename    : BadRequestException.js
 * @author      : 한주애 (juae0806@gmail.com)
 * @description : Error의 Getter, Setter
*/

class BadRequestException extends Error {
    constructor(msg = '잘못된 요청 입니다.', field = null){
        super(msg);
        // 멤버변수 추가
        this._statusCode = 400;
        this._field = field;
    }

    get statusCode() {
        return this._statusCode;
    }

    get field() {
        return this._field;
    }

    set field(params) {
        this._field = params;
    }
}
export default BadRequestException;
