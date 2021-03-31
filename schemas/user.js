var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
let dbHandle = require('../db.js').connection();
// mongoose.connect('mongodb://localhost:27017/swandb?authSource=admin');

var userSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		index: {
			unique: true
		}
	}, password: {
		type: String,
		required: true
	}, role: {
		type: String,
		enum: [ 'client', 'user', 'admin' ],
		required: [true, "Invalid role found."]
	},
	name: String,
	email: String,
	mobileNo: String,
	gender: {
		type: String,
		enum: [ 'M', 'F' ],
		required: [true, "Invalid Gender found."]
	}
}, {
	timestamps: true
});

//Generating a Hash
userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

userSchema.pre("save", function () {
	this.password = (bcrypt.hashSync(this.password, bcrypt.genSaltSync(8), null));
});

// create the model for users and expose it to our app
module.exports = dbHandle.model('User', userSchema, 'users');
