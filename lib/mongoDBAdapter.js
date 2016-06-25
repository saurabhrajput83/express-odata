/*!
 * express-odata
 * Copyright(c) 2016 Saurabh Rajput
 * MIT Licensed
 */

var mongoDBAdapter = function (mongoDBUrl) {
    var that = this;
    var mongo = require("mongodb");
    var dataServiceException = require("./dataServiceException");
    var MongoClient = mongo.MongoClient;

    var dbUrl = mongoDBUrl;




    that.insert = function (dataModel, callback) {
        MongoClient.connect(dbUrl, function (err, db) {
            console.log(err);
            if (err == null) {
                db.open(function (err) {
                    if (err == null) {
                        console.log("**** DATA REQUEST for insertRecordV2 :: dataModel: %s.", JSON.stringify(dataModel));
                        if (dataModel.type == "Entity") {

                            var entity = dataModel.entity;
                            var response = {};

                            db.collection(entity.name, function (err, collection) {
                                if (err == null) {
                                    collection.insert(entity.data, function (err, result) {
                                        if (err == null) {
                                            if (callback) {
                                                console.log(JSON.stringify(result));
                                                response[entity.id] = {
                                                    'State': result["result"],
                                                    '_id': result["ops"][0]["_id"]
                                                }
                                                callback(response);
                                            }
                                        }
                                        db.close();
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    };

    that.insertRecords = function (tableName, dataArr) {
        var data;
        var counter = 1;
        db.open(function (err) {
            if (err == null) {
                console.log("We are connected :: host: %s; port: %s; tableName: %s.", host, port, tableName);
                db.collection(tableName, function (err, collection) {
                    if (err == null) {
                        if (dataArr && dataArr.length > 0) {
                            for (var i = 0; i < dataArr.length; i++) {
                                data = dataArr[i];
                                collection.insert(data, function (err) {
                                    if (err == null) {
                                        console.log(counter + " Record Inserted.");
                                        counter++;
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
    };

    that.insertAllRecords = function (tableName, dataArr, callback) {
        var data;
        db.open(function (err) {
            if (err == null) {
                console.log("We are connected :: host: %s; port: %s; tableName: %s.", host, port, tableName);
                db.collection(tableName, function (err, collection) {
                    if (err == null) {
                        if (dataArr && dataArr.length > 0) {
                            collection.insert(dataArr, function (err) {
                                if (err == null) {
                                    console.log(dataArr.length + " Record Inserted for " + tableName + ".");
                                    if (callback) {
                                        callback(dataArr);
                                    }
                                }
                                db.close();
                            });
                        }
                    }
                });
            }
        });
    };

    ////////////
    // Selects documents in a collection
    ////////////
    that.read = function (queryOptions, callback) {
        return new Promise(function (resolve, reject) {
            var p_queryOptions = parseQueryOptions(queryOptions);
            if (!(p_queryOptions instanceof dataServiceException)) {

                MongoClient.connect(dbUrl, function (err, db) {
                    if (err == null) {
                        db.open(function (err) {
                            if (err == null) {

                                console.log("**** DATA REQUEST for read :: queryOptions: %s.", JSON.stringify(queryOptions));
                                console.log("**** DATA REQUEST for read :: p_queryOptions: %s.", JSON.stringify(p_queryOptions));

                                var collectionName = p_queryOptions.collection;
                                db.collection(collectionName, function (err, collection) {

                                    var filter = p_queryOptions.filter;
                                    var options = {};

                                    // For projection
                                    if (p_queryOptions.select) {
                                        options.fields = p_queryOptions.select;
                                    }
                                    if (p_queryOptions.sort) {
                                        options.sort = p_queryOptions.sort;
                                    }

                                    // for pagination
                                    var limit;
                                    var skip = 0;
                                    if (p_queryOptions.pageSize) {
                                        limit = p_queryOptions.pageSize;
                                    }
                                    if (p_queryOptions.pageNumber && p_queryOptions.pageSize) {
                                        skip = (p_queryOptions.pageSize * (p_queryOptions.pageNumber - 1));
                                    }
                                    collection.find(filter, options).toArray(function (err, items) {

                                        if (err == null) {
                                            var totalItemsCount = items.length;
                                            var parsedItems;
                                            if (limit && (totalItemsCount > limit)) {
                                                parsedItems = items.splice(skip, limit);
                                            } else {
                                                parsedItems = items;
                                            }
                                            var response = {};
                                            response['items'] = parsedItems;
                                            response['TotalRowCount'] = totalItemsCount;
                                            resolve(response);

                                        } else {
                                            reject(err);
                                        }
                                        db.close();
                                    });
                                });

                            } else {
                                reject(err);
                                db.close();
                            }
                        });
                    } else {
                        reject(err);
                        db.close();
                    }
                });
            } else {
                reject(p_queryOptions);
            }
        })
    };

    ////////////
    // Returns one document that satisfies the specified query criteria. 
    // If multiple documents satisfy the query, this method returns the first document according to the natural order which reflects the order of documents on the disk. 
    // If no document satisfies the query, the method returns null.
    ////////////
    that.readOne = function (queryOptions, callback) {
        return new Promise(function (resolve, reject) {
            var p_queryOptions = parseQueryOptions(queryOptions);
            if (!(p_queryOptions instanceof dataServiceException)) {

                MongoClient.connect(dbUrl, function (err, db) {
                    if (err == null) {
                        db.open(function (err) {
                            if (err == null) {

                                console.log("**** DATA REQUEST for readOne :: queryOptions: %s.", JSON.stringify(queryOptions));
                                console.log("**** DATA REQUEST for readOne :: p_queryOptions: %s.", JSON.stringify(p_queryOptions));

                                var collectionName = p_queryOptions.collection;

                                db.collection(collectionName, function (err, collection) {
                                    if (err == null) {

                                        var filter = p_queryOptions.filter;
                                        var options = {};

                                        // For projection
                                        if (p_queryOptions.select) {
                                            options.fields = p_queryOptions.select;
                                        }
                                        collection.findOne(filter, options, function (err, item) {
                                            if (err == null) {
                                                var response = {};
                                                response['item'] = item;
                                                resolve(response);
                                            } else {
                                                reject(err, callback);
                                            }
                                            db.close();
                                        });
                                    } else {
                                        reject(err);
                                        db.close();
                                    }
                                });
                            } else {
                                reject(err);
                                db.close();
                            }
                        });
                    } else {
                        reject(err);
                        db.close();
                    }
                });
            } else {
                reject(p_queryOptions);
            }
        });
    };

    that.removeRecords = function (tableName, filter) {
        db.open(function (err) {
            if (err == null) {
                console.log("We are connected :: host: %s; port: %s; tableName: %s; filter: %s.", host, port, tableName, JSON.stringify(filter));
                db.collection(tableName, function (err, collection) {
                    collection.remove(filter, function (err) {
                        if (err == null) {
                            console.log("Records Removed.");
                        }
                    });
                });
            }
        });
    };

    that.removeRecordsV2 = function (dataModel, callback) {
        MongoClient.connect(dbUrl, function (err, db) {
            if (err == null) {
                db.open(function (err) {
                    if (err == null) {
                        console.log("**** DATA REQUEST for removeRecordsV2:: dataModel: %s.", JSON.stringify(dataModel));
                        if (dataModel.type == "Entity") {
                            var entity = dataModel.entity;
                            var response = {};

                            db.collection(entity.name, function (err, collection) {
                                collection.remove(entity.filter, function (err, result) {
                                    if (err == null) {
                                        if (callback) {
                                            response[entity.id] = result;
                                            callback(response);
                                        }
                                    }
                                });
                            });
                        }
                    }
                });

            }
        });
    };

    that.updateRecord = function (tableName, query, data, options, callback) {
        db.open(function (err) {
            if (err == null) {
                console.log("**** DATA REQUEST for updateRecord:: tableName: %s; query: %s; data: %s; options: %s.", tableName, JSON.stringify(query), JSON.stringify(data), options);
                db.collection(tableName, function (err, collection) {
                    if (err == null) {
                        if (options === "push") {
                            collection.update(query, { $push: data }, { upsert: true }, function (err, result) {
                                if (err == null) {
                                    if (callback) {
                                        callback(result);
                                    }
                                }
                                db.close();
                            });
                        } else if (options === "set") {
                            collection.update(query, { $set: data }, function (err, result) {
                                if (err == null) {
                                    if (callback) {
                                        callback(result);
                                    }
                                }
                                db.close();
                            });
                        } else if (options === "pull") {
                            collection.update(query, { $pull: data }, function (err, result) {
                                if (err == null) {
                                    if (callback) {
                                        callback(result);
                                    }
                                }
                                db.close();
                            });
                        }

                    }
                });
            }
        });
    };

    that.updateRecordV2 = function (dataModel, callback) {
        MongoClient.connect(dbUrl, function (err, db) {
            if (err == null) {
                db.open(function (err) {
                    if (err == null) {
                        console.log("**** DATA REQUEST for updateRecordV2 :: dataModel: %s.", JSON.stringify(dataModel));

                        if (dataModel.type == "Entity") {
                            var entity = dataModel.entity;
                            var response = {};
                            var operator;

                            db.collection(entity.name, function (err, collection) {

                                if (err == null) {

                                    operator = entity.operator;
                                    if (operator === "push") {
                                        collection.update(entity.filter, { $push: entity.data }, { upsert: true },
                                            function (err, result) {
                                                if (err == null) {
                                                    response[entity.id] = result;
                                                    success(response, callback);
                                                } else {
                                                    error(err, callback);
                                                }
                                                db.close();
                                            });
                                    } else if (operator === "set") {
                                        collection.update(entity.filter, { $set: entity.data },
                                            function (err, result) {
                                                if (err == null) {
                                                    response[entity.id] = result;
                                                    success(response, callback);

                                                } else {
                                                    error(err, callback);
                                                }
                                                db.close();
                                            });
                                    } else if (operator === "pull") {
                                        collection.update(entity.filter, { $pull: entity.data },
                                            function (err, result) {
                                                if (err == null) {
                                                    response[entity.id] = result;
                                                    success(response, callback);

                                                } else {
                                                    error(err, callback);
                                                }
                                                db.close();
                                            });
                                    } else {
                                        collection.update(entity.filter, entity.data, entity.options,
                                            function (err, result) {
                                                if (err == null) {
                                                    response[entity.id] = result;
                                                    success(response, callback);

                                                } else {
                                                    error(err, callback);
                                                }
                                                db.close();
                                            });
                                    }

                                } else {
                                    error(err, callback);
                                }
                            });
                        }
                    } else {
                        error(err, callback);
                    }
                });
            } else {
                error(err, callback);
            }
        });
    };

    that.findAndModify = function (dataModel, callback) {
        MongoClient.connect(dbUrl, function (err, db) {
            if (err == null) {
                db.open(function (err) {
                    if (err == null) {
                        console.log("**** DATA REQUEST for findAndModify:: dataModel: %s.", JSON.stringify(dataModel));

                        if (dataModel.type == "Entity") {
                            var entity = dataModel.entity;
                            var params = entity.params || {};
                            var response = {};
                            var options = {
                                "new": true
                            };

                            if (params.Select) {
                                options.fields = params.Select;
                            }
                            if (params.upsert) {
                                options.upsert = params.upsert;
                            }

                            db.collection(entity.name, function (err, collection) {
                                if (err == null) {
                                    collection.findAndModify(entity.filter, [['_id', 1]], { $set: entity.data }, options, function (err, doc) {
                                        if (err == null) {
                                            response[entity.id] = doc.value;
                                            success(response, callback);
                                        }
                                        db.close();
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    };

    that.getIdentity = function (dataModel, callback) {
        MongoClient.connect(dbUrl, function (err, db) {
            if (err == null) {
                var tableName = "counters";
                db.open(function (err) {
                    if (err == null) {
                        console.log("**** DATA REQUEST for getIdentity:: dataModel: %s.", JSON.stringify(dataModel));

                        if (dataModel.type == "Entity") {
                            var entity = dataModel.entity;
                            var response = {};

                            db.collection(tableName, function (err, collection) {
                                if (err == null) {
                                    //if (_.isArray(coll)) {
                                    //    collection.update({ _id: { $in: coll } }, { $inc: { seq: 1 } }, { multi: true }, function (u_err, status) {
                                    //        if (u_err == null) {
                                    //            collection.find({ _id: { $in: coll } }).toArray(function (f_err, docs) {
                                    //                if (f_err == null) {
                                    //                    var results = {};
                                    //                    _.each(docs, function (doc) {
                                    //                        results[doc._id] = doc.seq;
                                    //                    });

                                    //                    if (callback) {
                                    //                        callback(results);
                                    //                    }
                                    //                }
                                    //                db.close();
                                    //            });
                                    //        }
                                    //    });
                                    //} else {
                                    collection.findAndModify({ _id: entity.name }, [['_id', 1]], { $inc: { seq: 1 } }, { new: true }, function (fm_err, doc) {
                                        if (fm_err == null) {
                                            var results = {};
                                            results[doc.value._id] = doc.value.seq;
                                            if (callback) {
                                                callback(results);
                                            }
                                        }
                                        db.close();
                                    });
                                    //}
                                }
                            });
                        }
                    }
                });
            }
        });
    };

    //var success = function (response, callback) {
    //    if (callback) {
    //        response = response || {};
    //        callback(null, response);
    //    }
    //}

    //var error = function (err, callback) {
    //    if (callback) {
    //        callback(err);
    //    }
    //}

    var parseQueryOptions = function (queryOptions) {
        try {
            var p_queryOptions = {
                collection: queryOptions.collection
            };
            if (queryOptions.$select) {
                p_queryOptions.select = queryOptions.$select.split(",");
            }
            if (queryOptions.$top) {
                p_queryOptions.pageSize = queryOptions.$top;
            }
            if (queryOptions.$orderby) {

                var orderby = queryOptions.$orderby;
                var sort = {};
                var flag = 1;
                var orderbyArr = orderby.split(" ");

                if (orderbyArr.length > 1 && orderbyArr[1] === "desc") {
                    flag = -1
                }
                sort[orderbyArr[0]] = flag;
                p_queryOptions.sort = sort;
            }
            if (queryOptions.$filter) {

                var ast = parser.parse("$filter=" + queryOptions.$filter);
                if (ast && ast['$filter']) {
                    var obj = ast['$filter'];
                    var filter = {};
                    evaluateType(obj, filter);
                    p_queryOptions.filter = filter;
                }
            }
            if (queryOptions._id) {

                var filterObj = p_queryOptions.filter || {};
                filterObj['_id'] = new mongo.ObjectID(queryOptions._id);
                p_queryOptions.filter = filterObj;
            }
            return p_queryOptions;
        } catch (err) {
            return new dataServiceException(err);
        }
    };

    var evaluateType = function (obj, filter) {
        var left, right;

        if (obj['type'] === "eq" || obj['type'] === "ne" || obj['type'] === "gt" || obj['type'] === "ge" || obj['type'] === "lt" || obj['type'] === "le") {
            left = evaluateLeft(obj['left'], filter);
            right = evaluateRight(obj['right'], filter);

            var operator;

            switch (obj['type']) {
                case "eq":
                    operator = "$eq";
                    break;
                case "ne":
                    operator = "$ne";
                    break;
                case "gt":
                    operator = "$gt";
                    break;
                case "ge":
                    operator = "$gte";
                    break;
                case "lt":
                    operator = "$lt";
                    break;
                case "le":
                    operator = "$lte";
                    break;
            }

            if (operator) {
                if (left === "_id") {
                    var operatorObj = {};
                    operatorObj[operator] = new mongo.ObjectID(right);
                    filter[left] = operatorObj;
                } else {
                    var operatorObj = {};
                    operatorObj[operator] = right;
                    filter[left] = operatorObj;
                }
            }
        } else if (obj['type'] === "and") {

            evaluateLeft(obj['left'], filter);
            evaluateRight(obj['right'], filter);
        }
    };

    var evaluateLeft = function (obj, filter) {
        if (obj['type'] === "property") {
            return obj["name"];
        } else if (obj['type'] === "and" || obj['type'] === "eq" || obj['type'] === "ne" || obj['type'] === "gt" || obj['type'] === "ge" || obj['type'] === "lt" || obj['type'] === "le") {
            evaluateType(obj, filter);
        }
    };

    var evaluateRight = function (obj, filter) {
        if (obj['type'] === "literal") {
            return obj["value"];
        } else if (obj['type'] === "and" || obj['type'] === "eq" || obj['type'] === "ne" || obj['type'] === "gt" || obj['type'] === "ge" || obj['type'] === "lt" || obj['type'] === "le") {
            evaluateType(obj, filter);
        }
    };


};

module.exports = mongoDBAdapter;