var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../models/user');
var passport =  require('passport');
var authenticate = require('../authenticate');
var cors = require ('./cors');
router.use(bodyParser.json());
 

/* GET users listing. */
router.get('/',cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,
			(req, res, next)=> {
				
				User.find({})
					.then((user)=>{
					
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(users);
				
				}, (err) => next(err))
					.catch((err) => next(err));
		});


router.post('/signUp',cors.corsWithOptions, (req,res,next) => {
	
	User.register(new User({username : req.body.username}),req.body.password,(err,user) =>{
		if(err){
			res.statusCode = 403;
			res.setHeader('Content-Type','application/json');
			res.json({err:err});
		}
		else{
			if(req.body.firstname)
				user.firstname = req.body.firstname;
			if(req.body.lastname)			
				user.lastname = req.body.lastname;
			user.save((err,user) =>{
				if(err){
					res.statusCode = 500;
					res.setHeader('Content-Type','application/json');
					res.json({err:err});
					return ;
				}
				
				passport.authenticate('local')(req,req,() =>{
				res.statusCode = 200;
				res.setHeader('Content-Type','application/json');
				res.json({success : true ,status:'You are Registered Successful'});

			});
			});
		}
	});
});

router.post('/login',cors.corsWithOptions, passport.authenticate('local'),(req, res) => {
				var token = authenticate.getToken({_id: req.user._id});
				res.statusCode = 200;
				res.setHeader('Content-Type','application/json');
				res.json({success : true, token : token, status:'You are Successfully logged In'});

});

router.get('/logout',cors.corsWithOptions,(req,res,next)=>{
	if(req.session){
		req.session.destroy();
		res.clearCookie('session-Id');
		res.redirect('/');
	}
	else{
		var err = new Error('You are not logged In')
		err.status = 403;
		next(err);
	}
});

module.exports = router;
