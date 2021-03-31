var mongoose = require('mongoose');
let dbHandle = require('../db.js').connection();

var productSchema = mongoose.Schema({
	name: String,
	barcode: {
		type: Number,
		index: true,
		unique: true
	},
	brand: String,
	description: String,
	price: Number,
	available: Boolean
}, {
	timestamps: true
});

module.exports = dbHandle.model('Product', productSchema, 'products');
