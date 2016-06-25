/*!
 * express-odata
 * Copyright(c) 2016 Saurabh Rajput
 * MIT Licensed
 */

var express = require('express');
var js2xmlparser = require("js2xmlparser");
var dataServiceConfiguration = require("./dataServiceConfiguration");
var dataServiceHost = require("./dataServiceHost");
var mongoDBAdapter = require("./mongoDBAdapter");
var uriProcessor = require("./uriProcessor");
var storage = require("./storage");
var dataServiceHost = require("./dataServiceHost");
var underscore = require("underscore");
var dbObj, dsc;
var router = express.Router();
var app = express();


var dsc = new dataServiceConfiguration();
var dsh = new dataServiceHost(dsc);
var urip = new uriProcessor();

var entitySets;
var _mongoDBUrl;


router.use(function (req, res, next) {
    entitySets = dsc.entitySets;

    next();
});

router.get('/', function (req, res) {

    var collections = entitySets;
    var entitySet;

    serializeResult(req, res, entitySets);


});

router.get('/:resourceName', handleGetRequest);

router.post('/:resourceName', handlePostRequest);

function handleGetRequest(req, res, next) {

    createProviders();

    if (validateEntitySetAndServiceOperation(req, res)) {

        // Validate the query parameters
        result = dsh.validateQueryParameters(req);
        if (result.state === "error") {
            serializeError(req, res, result);
        } else {

            // Process the uri to query dbObj
            var queryOptions = urip.process(req);
            if (queryOptions) {
                queryDB(req, res, queryOptions);
            }
        }
    }

};

function handlePostRequest(req, res, next) {

    createProviders();

    if (validateEntitySetAndServiceOperation(req, res)) {
        insertIntoDB(req, res);
        serializeResult(req, res, req.body);
    }

};

function createProviders() {
    dbObj = new mongoDBAdapter(dsc.mongoDBUrl);
}

function queryDB(req, res, queryOptions) {

    var matches = req.params.resourceName.match(/\(([^)]+)\)/);
    if (matches === null) {

        dbObj.read(queryOptions).then(function (results) {
            serializeResult(req, res, results);
        }).catch(function (err) {
            serializeError(req, res, err);
        });

    } else {
        queryOptions._id = matches[1];

        dbObj.readOne(queryOptions).then(function (result) {
            serializeResult(req, res, result);
        }).catch(function (err) {
            serializeError(req, res, err);
        });
    }
};

function insertIntoDB(req, res, queryOptions) {

    var matches = req.params.resourceName.match(/\(([^)]+)\)/);
    if (matches === null) {

        dbObj.read(queryOptions).then(function (results) {
            results = results || {};
            serializeResult(req, res, result["items"]);
        }).catch(function (err) {
            serializeError(req, res, err);
        });

    } else {
        queryOptions._id = matches[1];

        dbObj.readOne(queryOptions).then(function (result) {
            result = result || {};
            serializeResult(req, res, res["item"]);
        }).catch(function (err) {
            serializeError(req, res, err);
        });
    }
};

function serializeResult(req, res, result) {

    result = result || null;

    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    var out = {
        "@odata.context": fullUrl,
        "value": result,
        "state": "OK"
    };

    return res.json(out);
}

function serializeError(req, res, err) {

    var errorMessage;
    if (typeof err === "string") {
        errorMessage = error;
    } else {
        err = err || {};
        errorMessage = err.errorMessage;
    }

    var error = {
        "odata.error": {
            "code": "",
            "message": decodeURIComponent(errorMessage),
            "state": "error"
        }
    }
    res.json(error);
}

function initializeService(func) {
    if (func) {
        func();
    }
}

var validateEntitySetAndServiceOperation = function (req, res) {
    // Validate the RequestMethod
    var result = dsh.validateRequestMethod(req);
    if (result.state === "error") {

        console.log("validateRequestMethod");
        serializeError(req, res, result);
        return false;
    } else {

        // Validate the EntitySet
        result = dsh.validateEntitySet(req);
        if (result.state === "error") {

            console.log("validateEntitySet");
            //  Validate the ServiceOperation 
            result = dsh.validateServiceOperation(req);
            if (result.state === "error") {

                console.log("validateServiceOperation");
                serializeError(req, res, result);
                return false;
            } else {

                var serviceOperation = underscore.find(dsc.serviceOperations, function (obj) {
                    return obj.name === req.params.resourceName;
                });

                if (serviceOperation.callback) {
                    var serviceOperationResult = {};
                    serviceOperation.callback(req, res, dbObj);
                } else {
                    serializeError(req, res, "To DO");
                    return false;
                }
            }

        }
        return true;
    }

}

//module.exports.dataServiceConfiguration = new dataServiceConfiguration();
module.exports = {
    router: router,
    initializeService: initializeService,
    dataServiceConfiguration: dsc
};