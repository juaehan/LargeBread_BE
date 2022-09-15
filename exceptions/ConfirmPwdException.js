class ConfirmPwdException extends Error {
    constructor(msg = '비밀번호가 일치하지 않습니다.') {
        super(msg);
        // 멤버변수 추가
        this._statusCode = 400;
    }

    get statusCode() {
        return this._statusCode;
    }
}

export default ConfirmPwdException;