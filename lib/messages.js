/*!
 * express-odata
 * Copyright(c) 2016 Saurabh Rajput
 * MIT Licensed
 */

var messages = {
    "uriProcessorResourceNotFound":
        "Resource not found for the segment '$segment'",
    "dataServiceMethodSupport":
        "This release of library does not support $method request.",
    "dataServiceHostNonODataOptionBeginsWithSystemCharacter":
        "The query parameter '$optionName' begins with a system-reserved '$' character but is not recognized."
};

module.exports = messages;