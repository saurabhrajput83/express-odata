/*!
 * express-odata
 * Copyright(c) 2016 Saurabh Rajput
 * MIT Licensed
 */

var url = require("url");


var uriProcessor = function () {

    var that = this;

    that.process = function (req) {

        var requrl = url.parse(req.url, true);
        //// queryOptions
        var queryOptions = {};
        if (requrl.search) {
            var query = requrl.query;
            //// For Expansion  
            if (query.$expand) queryOptions.$expand = decodeURIComponent(query.$expand);
            //// For Filtering
            if (query.$filter) queryOptions.$filter = decodeURIComponent(query.$filter);
            //// For Formatting data  
            if (query.$format) queryOptions.$format = decodeURIComponent(query.$format);
            //// For Projection of fields 
            if (query.$select) queryOptions.$select = decodeURIComponent(query.$select);
            //// For Pagination  
            if (query.$skip) queryOptions.$skip = decodeURIComponent(query.$skip);
            if (query.$top) queryOptions.$top = decodeURIComponent(query.$top);
            if (query.$skiptoken) queryOptions.$skiptoken = decodeURIComponent(query.$skiptoken);
            if (query.$inlinecount) queryOptions.$inlinecount = decodeURIComponent(query.$inlinecount);
            //// For Ordering 
            if (query.$orderby) queryOptions.$orderby = decodeURIComponent(query.$orderby);
            //var encodedQS = decodeURIComponent(querystring.stringify(fixedQS));
        }

        var resourceName = req.params.resourceName;
        matches = resourceName.match(/\(([^)]+)\)/);
        if (matches === null) {
            queryOptions.collection = resourceName;
        } else {
            queryOptions.collection = resourceName.replace(matches[0], "");
        }

        return queryOptions;
    };


};


module.exports = uriProcessor;