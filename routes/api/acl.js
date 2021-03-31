let acl = {
	client: {
		'/review': true,
		'/search': true
	}, admin: {
		'/': true
	}
};


module.exports = acl;