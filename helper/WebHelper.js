import logger from "./LogHelper.js";

const WebHelper = () => {
    return (req, res, next) => {
        req._getParam = (method, key, def = null) => {
            let value = null;

            if (method.toUpperCase() === 'GET') {
                value = req.query[key] || req.params[key] || def;
            } else {
                value = req.body[key] || def;
            }

            if (value === undefined) {
                value = def;
            }

            if (value !== null && typeof value == 'string') {
                value = value.trim();

                if (value.length === 0) {
                    value = def;
                }
            }

            logger.debug('[HTTP %s Params] %s=%s', method, key, value);
            return value;
        };

        req.get = function(key, def) {
            return this._getParam('GET', key, def);
        };

        req.post = function(key, def) {
            return this._getParam('POST', key, def);
        };

        req.put = function(key, def) {
            return this._getParam('PUT', key, def);
        };

        req.delete = function(key, def) {
            return this._getParam('DELETE', key, def);
        };

        res._sendResult = (statusCode, message, data=null) => {
            const json = {
                rt: statusCode || 200,
                rtmsg: message || 'OK'
            };

            if (data) {
                json.data = data;
            }

            const offset = new Date().getTimezoneOffset() * 60000;
            const today = new Date(Date.now() - offset);
            json.pubdate = today.toISOString();

            res.header('Content-Type', 'application/json; charset=utf-8');
            res.header('message', encodeURIComponent(json.rtmsg));
            res.status(json.rt).send(json);
        };

        res.sendResult = (data) => {
            res._sendResult(200, 'OK', data);
        };

        res.sendError = (error) => {
            logger.error(`[${error.name}] ${error.message}`);
            logger.error(error.stack);

            if (error.statusCode == undefined) {
                error.statusCode = 500;
            }
            res._sendResult(error.statusCode, error.message);
        };

        next();
    };
};

export default WebHelper;