/*!
 * express-odata
 * Copyright(c) 2016 Saurabh Rajput
 * MIT Licensed
 */

var dataServiceConfiguration = function () {

    var that = this;
    that.entitySets = [];
    that.serviceOperations = [];
    that.mongoDBUrl = "";
    that.requestMethods = ["GET", "POST"];
    that.queryParameters = ["$select", "$top", "$skip", "$filter", "$orderby"];


    that.setEntitySetAccessRule = function (name, rights) {
        that.entitySets.push({
            name: name,
            rights: rights
        });
    };

    that.setServiceOperationAccessRule = function (name, callback) {

        that.serviceOperations.push({
            name: name,
            callback: callback
        });
    };

    that.setMongoDBUrl = function (mongoDBUrl) {
        that.mongoDBUrl = mongoDBUrl
    };
};

module.exports = dataServiceConfiguration;