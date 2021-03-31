const config = require('../../config.js');
const express = require('express');
const async = require('async');
const router = express.Router();
const services = require("../../services/dbhelper.js")
const jwt = require('jsonwebtoken');
const acl = require('./acl');
const multer  = require('multer')
const upload = multer({dest: 'uploads/'})
const fs = require("fs");
const dbhelper = require("../../services/dbhelper.js");

// routes
router.all('*', authenticateJWT, checkAccess);

router.post('/', upload.single('products'), processFile);
router.post('/review', reviewProduct);
router.post('/search', searchProducts);

module.exports = router;

function authenticateJWT(req, res, next) {
    let token = req.body.access_token || req.query.access_token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, result) {
            if(err) {
            	return res.send({
            		status: "fail",
            		message: "Invalid Token found."
            	});
            };
            // Not checking valid user or not means user deleted or revoked
            req.tokenInfo = result;
            return next();
        })
    } else {
        return res.status(400).send({
            status: "fail",
            message: "Access Token not found."
        })
    }
};

function checkAccess (req, res, next) {
	const {role} = req.tokenInfo;

	if ((acl[role] || {})[req.path]) {
		return next();
	} else {
		return res.status(400).send({
			status: "fail",
			message: "Access Denied."
		});
	}
}

function processFile (req, res) {
	let fd = req.file;
	if (!fd) {
		return res.status(400).send({
			status: "fail",
			message: "File Not Found."
		});
	};
	var fc = fs.readFileSync(fd.path, 'utf-8');

	fc = fc.split("\n");

	fc.shift();
	let result = [];
	async.forEachLimit(fc, 1, function (row, fELB) {
		row = row.split(",");
		dbhelper.create("products", {
			name: row[0],
			barcode: parseInt(row[1]),
			brand: row[2],
			description: row[3],
			price: parseFloat(row[4]),
			available: row[5] == "true"
		})
		.then(function (results) {
			console.log(results)
	        result.push({status: "success", message: "Product created successfully."});
	        return fELB();
	    })
	    .catch(function (err) {
	        result.push({status: "fail", message: err.message});
	        return fELB();
	    });
	}, function () {
		return res.send(result);
		// File unlinking has to be done here before request ends
	});

}
async function reviewProduct (req, res)  {
	let {_id} = req.tokenInfo;
	let barcode = req.body.barcode;
	let review = req.body.review;
	let validateProduct = await dbhelper.findOne("products", {
		query: {
			barcode: barcode
		}
	});
	if (!validateProduct)
		return res.send({
			status: "fail",
			message: "Product not found to review."
		});
	dbhelper.create("reviews", {
		userId: _id,
		barcode: barcode,
		review: review
	})
	.then(function (review) {
        res.status(200).send({status: "success", message: "Review created successfully."});
    })
    .catch(function (err) {
        res.status(400).send({status: "fail", message: err.message});
    });
};

async function searchProducts (req, res, next) {
	let searchText = req.query.searchText;
	let page = parseInt(req.query.page) || 0;

	let recordsPerPage = 10;
	let responses = [], count = 0;

	async.parallel ([async function (sCB1) {
		count = await dbhelper.count("products", {
			query: {
				"name": {
					$regex: (searchText || "").toString().toLowerCase(),
					$options: "ig"
				}
			}
		}).catch(function (err) {
			console.log("count matcher error", err);
			return 0;
		});
		// console.log(count)
		return sCB1();
	}, async function (sCB2) {
		let results = await dbhelper.find("products", {
			query: {
				"name": {
					$regex: (searchText || "").toString().toLowerCase(),
					$options: "im"
				}
			}, skip: Math.max(page - 1, 0)*recordsPerPage,
			limit: recordsPerPage
		}).catch(function (err) {
			return res.status(400).send({
				status: "fail",
				message: err.message
			});
		});
		results = results.map(e => {
			delete e.createdAt;
			delete e.updatedAt;
			delete e['__v'];
			return e;
		});
		console.log(results, "results")
		async.forEachLimit(results, 1, async function (product, fELCB) {
			let reviews = await dbhelper.find("reviews", {
				query: {
					barcode: product.barcode
				}, sort: {
					created: -1
				}, limit: 2, populate: "userId"
			}).catch(e => {
				console.log("find reviews error", e);
				return [];
			});
			product.reviews = reviews.map(e => {
				return {
					name: e.userId.name || "",
					review: e.review || ""
				};
			});
			responses.push(product);
			return fELCB();
		}, function () {
			console.log(sCB2, "sCB2")
			return sCB2();
		});
	}], function () {
		return res.send({
			status: "success",
			message: "",
			totalCount: count,
			products: responses
		});
	})
};