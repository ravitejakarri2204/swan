var userModel = require('../schemas/user');
var productsModel = require('../schemas/products');
var reviewsModel = require('../schemas/reviews');

var getModel = collection => {
	var model;
	if (!collection) {
		return null;
	};
	switch (collection.toLowerCase()) {
		case 'user':
		case 'users':
			model = userModel;
			break;
		case 'products':
			model = productsModel;
			break;
		case 'reviews':
			model = reviewsModel;
			break;
		default:
			console.log('Model %s not defined', collection);
	};
	return model;
};
var dbCreateDocument = async (collection, obj) => {
	var model, newDocument;
	model = getModel(collection);
	if (!model) {
		return {
			status: 'fail',
			message: 'Missing collection name.'
		};
	};
	try {

		newDocument = new model(obj);
		// console.log(newDocument, "newDocument", model)
		var result = await newDocument.save();
		return {
			status: 'success',
			message: '',
			newObject: newDocument
		};
	} catch (error) {
		console.log('*******************error**********************', error, error.message)
		throw error;
	}
};
var dbQueryBuilder = async (collection, query) => {
	var model;
	model = getModel(collection);
	if (!model) {
		return {
			status: 'fail',
			message: 'Missing collection name.'
		};
	};
	var modelQB = model.findOne(query.query)
	if (query.select)
		modelQB.select(query.select);
	if (query.sort)
		modelQB.sort(query.sort);
	if (query.skip)
		modelQB.skip(query.skip);
	if (query.limit)
		modelQB.limit(query.limit);
	if (query.populate && query.populateSelected) {
		modelQB.populate(query.populate, query.populateSelected);
	} else if (query.populate) {
		modelQB.populate(query.populate);
	};
	modelQB.lean();
	try {
		var data = await modelQB.exec();
		return data;
	} catch (error) {
		console.log("findOne error(): ", error.message);
		throw error;
	}
};
var dbFindBuilder = async (collection, query) => {
	var model;
	model = getModel(collection);
	if (!model) {
		return {
			status: 'fail',
			message: 'Missing collection name.'
		};
	};
	var modelQB = model.find(query.query)
	if (query.sort)
		modelQB.sort(query.sort);
	if (query.skip)
		modelQB.skip(query.skip);
	if (query.limit)
		modelQB.limit(query.limit);
	modelQB.lean();
	try {
		var data = await modelQB.exec();
		throw new Error("BLA");
		return data;
	} catch (error) {
		console.log("find error(): ", error);
		throw error;
	}
};
var dbCountBuilder = async (collection, query) => {
	var model;
	model = getModel(collection);
	if (!model) {
		return {
			status: 'fail',
			message: 'Missing collection name.'
		};
	};
	var modelQB = model.countDocuments(query.query)
	modelQB.lean();
	try {
		var data = await modelQB.exec();
		return data;
	} catch (error) {
		console.log("count error(): ", error.message);
		throw error;
	}
};
module.exports = {
	'create': dbCreateDocument,
	'findOne': dbQueryBuilder,
	'find': dbFindBuilder,
	'count': dbCountBuilder,
};
