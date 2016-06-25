/*!
 * express-odata
 * Copyright(c) 2016 Saurabh Rajput
 * MIT Licensed
 */

var dataServiceException = function (errorMessage) {
    var that = this;
    that.errorMessage = errorMessage;
};

module.exports = dataServiceException;