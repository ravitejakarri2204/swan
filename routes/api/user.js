const config = require('../../config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const dbhelper = require("../../services/dbhelper.js")

// routes
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;

function registerUser(req, res) {
    if (!(req.body.username && req.body.password)) {
        return res.status(400).send({
            status: "fail",
            message: "Mandatory fields not provided."
        });
    };
    dbhelper.create("users", req.body)
    .then(function () {
        return res.status(200).send({status: "success", message: "User created successfully."});
    })
    .catch(function (err) {
        return res.status(400).send({status: "fail", message: err.message});
    });
}

function loginUser (req, res) {
	if (!(req.body.username && req.body.password)) {
		return res.status(400).send({
			status: "fail",
			message: "Mandatory fields not provided."
		});
	};
    dbhelper.findOne("users", {
    	query: {
    		username: req.body.username
    	}
    })
    .then(function (userObj) {
    	if (userObj) {
    		if (bcrypt.compareSync(req.body.password, userObj.password)) {
    			return res.send({
    				status: "success",
    				token: jwt.sign({ _id: userObj._id, role: userObj.role }, config.secret)
    			});
    		} else {
    			return res.send({
    				status: "fail",
    				message: "Invalid credentials found."
    			})
    		}
    	} else {
    		return res.send({
    			status: "fail",
    			message: "User not found."
    		});
    	};
    })
    .catch(function (err) {
        return res.status(400).send({
        	status: "fail",
        	message: err.message
        });
    });
};