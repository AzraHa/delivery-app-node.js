const User = require('../models/User');


//Create token
const maxAge = 3 *24 *60 *60 ;
const createToken = (id) => {
    return jwt.sign({id},'strasno',{
        expiresIn: maxAge
    });
}
module.exports.login_get = (req,res) => {
    res.render('login');
}
module.exports.registration_get = (req,res) => {
    res.render('registration');
}

module.exports.registration_post = async (req,res) => {
    const {name, email, password, password2, address} = req.body;
    let errors = [];

    if (!name || !email || !password || !password2 || !address) {
        errors.push({msg: 'Please enter all fields'});
    }

    if (password != password2) {
        errors.push({msg: 'Passwords do not match'});
    }

    if (password.length < 6) {
        errors.push({msg: 'Password must be at least 6 characters'});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
            address
        });
    }else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                    address
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password,
                    address
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
                console.log(newUser);
            }
        });
    }

}
module.exports.login_post = passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
})(req, res, next);