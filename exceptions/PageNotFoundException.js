class PageNotFoundException extends Error {
    constructor(msg = '페이지를 찾을 수 없습니다.'){
        super(msg);

        this._statusCode = 404;
    }

    get statusCode(){
        return this._statusCode;
    }
}

export default PageNotFoundException;