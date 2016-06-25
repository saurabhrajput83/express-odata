/*!
 * express-odata
 * Copyright(c) 2016 Saurabh Rajput
 * MIT Licensed
 */

var url = require("url");
var messages = require("./messages");

//"protocol":null,
//"slashes":null,
//"auth":null,
//"host":null,
//"port":null,
//"hostname":null,
//"hash":null,
//"search":"?$skip=1&$top=1&$count=1&$filter=%27one%20eq%201%27",
//"query":{"$skip":"1","$top":"1","$count":"1","$filter":"'one eq 1'"},
//"pathname":"/Projects",
//"path":"/Projects?$skip=1&$top=1&$count=1&$filter=%27one%20eq%201%27",
//"href":"/Projects?$skip=1&$top=1&$count=1&$filter=%27one%20eq%201%27"}

var dataServiceHost = function (dataServiceConfiguration) {
    var that = this;

    var parameters = [];

    that.validateRequestMethod = function (req) {

        var state = "ok", errorMessage = '';
        var requestMethod = req.method;

        if (dataServiceConfiguration.requestMethods.indexOf(requestMethod) == -1) {
            state = "error";
            errorMessage = messages['dataServiceMethodSupport'];
            errorMessage = errorMessage.replace("$method", requestMethod);
        }

        return {
            state: state,
            errorMessage: errorMessage
        };
    };

    that.validateEntitySet = function (req) {

        var state = "error";
        var errorMessage = messages['uriProcessorResourceNotFound'];

        var resourceName = req.params.resourceName;
        var entitySets = dataServiceConfiguration.entitySets;
        var entitySet;
        var matches;
        errorMessage = errorMessage.replace("$segment", resourceName);

        for (var i = 0, len = entitySets.length; i < len; i++) {
            entitySet = entitySets[i];
            matches = resourceName.match(/\(([^)]+)\)/);
            if (matches === null) {
                if (entitySet.name == resourceName) {
                    state = "ok";
                    errorMessage = "";
                    break;
                }
            } else {
                if (matches.length > 1) {
                    if ((entitySet.name + "" + matches[0]) == resourceName) {
                        state = "ok";
                        errorMessage = "";
                        break;
                    }
                }
            }
        }

        return {
            state: state,
            errorMessage: errorMessage
        };
    };

    that.validateServiceOperation = function (req) {

        var state = "error";
        var errorMessage = messages['uriProcessorResourceNotFound'];

        var resourceName = req.params.resourceName;
        var serviceOperations = dataServiceConfiguration.serviceOperations;
        var serviceOperation;
        var matches;
        errorMessage = errorMessage.replace("$segment", resourceName);

        for (var i = 0, len = serviceOperations.length; i < len; i++) {
            serviceOperation = serviceOperations[i];
            if (serviceOperation.name == resourceName) {
                state = "ok";
                errorMessage = "";
                break;
            }
        }

        return {
            state: state,
            errorMessage: errorMessage
        };
    };

    that.validateQueryParameters = function (req) {

        var state = "ok", errorMessage = '';

        var requrl = url.parse(req.url, true);
        if (requrl.search) {
            var query = requrl.query;
            for (var key in query) {
                if (dataServiceConfiguration.queryParameters.indexOf(key) == -1) {
                    state = "error";
                    errorMessage = messages['dataServiceHostNonODataOptionBeginsWithSystemCharacter'];
                    errorMessage = errorMessage.replace("$optionName", key);
                    break;
                }
            }
        }
        return {
            state: state,
            errorMessage: errorMessage
        };
    }
};

module.exports = dataServiceHost;