const express = require('express'),
    router = express.Router(),
    gravatar = require('gravatar'),
    bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
    passwort = require('passport');


const User = require('../../models/User'),
    keys = require('../../config/keys'),
    validateRegisterInput = require('../../validation/register'),
    validateLoginInput = require('../../validation/login');



router.get('/test', (req, res) => res.json({ msg: 'testing user route' }));

// register user
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                errors.email = 'Email already exists';
                return res.status(400).json(errors.email);
            } else {

                const avatar = gravatar.url(req.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                res.json(user);
                            }).catch(err => {
                                console.log(err);
                            });
                    });
                });
            }
        });
});

router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }
    
    const email = req.body.email,
        password = req.body.password;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                errors.email = 'No user found'
                return res.status(404).json(errors.email);
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {

                        const payload = { id: user.id, name: user.name, avatar: user.avatar };

                        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            })

                    } else {
                        errors.password = 'Wrong Credentials';
                        return res.status(400).json(errors.password);
                    }
                }).catch(err => {
                    console.log(err);
                });
        });
});


// @access private
router.post('/current', passwort.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar
    });
})

module.exports = router;