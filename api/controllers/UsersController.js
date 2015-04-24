/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	subscribe: function (req, res) {
		if (req.isSocket) {
			Users.find({}).exec(function (err, users) {
				if (err) res.negotiate(err);
				Users.watch(req);
				Users.subscribe(req.socket, users);
			});
		}
	},

	chat_subscribe: function (req, res) {
		if (req.isSocket) {
			var user_id = req.param('user_id');
			sails.sockets.join(req.socket, user_id);
			console.log('New Subscribed');
		}
	},

	chat_send_message: function (req, res) {
		if (req.isSocket) {
			Users.findOne({id: req.param('from_user_id')}).exec(function (err, user){
				if (err) res.negotiate(err);
				var user_id = req.param('user_id');
				var from_user_id = req.param('from_user_id');
				var message = req.param('message');
				var id = Math.floor(Math.random() * 999999) + 55666
				sails.sockets.broadcast(user_id, 'chat_private_message', { message: message, from: user.name, id: id });
				sails.sockets.broadcast(from_user_id, 'chat_private_message', { message: message, id: id });
			});
		}
	},

	chat_send_all_message: function (req, res) {
		if (req.isSocket) {
			Users.findOne({id: req.param('from_user_id')}).exec(function (err, user){
				if (err) res.negotiate(err);
				var from_user_id = req.param('from_user_id');
				var message = req.param('message');
				var id = Math.floor(Math.random() * 999999) + 55666
				sails.sockets.blast('chat_all_message', { message: message, from: user.name, id: id }, req.socket);
			});
		}
	},

	login: function (req, res) {
		var bcrypt = require('bcrypt');
		if (req.method == 'POST') {
			Users.findOne({
				email: req.param('email'),
				isLoggedIn: false
			}). exec(function (err, user){
				if (err) res.negotiate(err);
				if (user) {
					bcrypt.compare(req.param('password'), user.password, function(err, equals) {
					    if (err) res.negotiate(err);
							if (equals) {
								var cuser = user;
								cuser.isLoggedIn = true;
								cuser.save(function (err, user){
									if (err) res.negotiate(err);
									req.session.authenticated = true;
									req.session.user = user;
									Users.publishUpdate(user.id, { isLoggedIn: user.isLoggedIn } );
									return res.json({message: 'ok', user: user});
								});
							} else {
								res.json({message: 'Email/password invalid!, try again.'});
							}
					});
				} else{
					res.json({message: 'Error, try again.'});
				}
			});
		}

	},

	logout: function (req, res) {

		if (req.session.authenticated) {
			Users.update({
				id: req.session.user.id,
			}, {
				isLoggedIn: false,
			}).exec(function (err, user) {
				if (err) res.negotiate(err);
				Users.publishUpdate(req.session.user.id, { isLoggedIn: false } );
				delete req.session.authenticated;
				delete req.session.user;
				res.redirect('/');
			});
		} else {
			delete req.session.authenticated;
			delete req.session.user;
			res.redirect('/');
		}

	},

	new: function (req, res) {

		if (req.session.authenticated) {
			res.redirect('/users/show_all');
		}

		res.view(null, {});
	},

	create: function (req, res) {
		if (req.method == 'POST'){
			Users.create({
				name: req.param('name'),
				email: req.param('email'),
				password: req.param('password'),
				isLoggedIn: true
			}).exec(function (err, user){
				if (err) res.negotiate(err);
				Users.publishCreate(user);
				req.session.authenticated = true;
				req.session.user = user;
				res.json({message: 'ok', user: user});
			});
		}
	},

	show: function (req, res) {

	},

	edit: function (req, res) {

	},

	delete: function (req, res) {

	},

	show_all: function (req, res) {
		Users.find({}).exec(function (err, users){
			if (err) res.negotiate(err);
			res.view(null, {users: users, session: req.session});
		});
	},

	index: function (req, res) {

		if (req.session.authenticated) {
			res.redirect('/users/show_all');
		}

		res.view(null, {});
	},

};
