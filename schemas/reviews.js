var mongoose = require('mongoose');
let dbHandle = require('../db.js').connection();

var reviewSchema = mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	barcode: Number,
	review: String
}, {
	timestamps: { createdAt: true, updatedAt: false  }
});

reviewSchema.index({barcode: 1, createdAt: 1 })

module.exports = dbHandle.model('Review', reviewSchema, 'reviews');
