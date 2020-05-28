const { Router } = require('express');
const router = Router();
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const nodemailerST = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const keys = require('../keys');
const transporter = nodemailer.createTransport(nodemailerST({ auth: { api_key: keys.SEND_GRID_API_KEY }}));
const registrationEmail = require('../emails/registration');

router.get('/login', async (req, res) => {
   res.render('auth/login', {
      title: 'Authorization',
      isLogin: true,
      loginError: req.flash('loginError'),
      registerError: req.flash('registerError')
   });
});

router.post('/login', async (req, res) => {
   try {
      const { email, password } = req.body;
      const userCandidate = await User.findOne({ email });

      if (userCandidate) {
         const isCorrectPassword = await bcryptjs.compare(password, userCandidate.password);

         if (isCorrectPassword) {
            req.session.user = userCandidate;
            req.session.isAuthenticated = true;

            req.session.save(err => {
               if (err) {
                  throw err;
               }
               res.redirect('/');
            });
         } else {
            res.redirect('/auth/login#login');
         }
      } else {
         req.flash('loginError', 'There is no such user');
         res.redirect('/auth/login#login');
      }
   } catch (e) {
      console.error(e);
   }
});

router.get('/logout', async (req, res) => {
   req.session.destroy(() => {
      res.redirect('/auth/login#login');
   });
});

router.post('/register', async (req, res) => {
   try {
      const { name, email, password, repeat } = req.body;
      const userWithEmail = await User.findOne({ email });

      if (userWithEmail) {
         req.flash('registerError', 'Entered email already exists');
         res.redirect('/auth/login#register');
      } else {
         const hashPassword = await bcryptjs.hash(password, 10);
         const user = new User({ name, email, password: hashPassword, cart: { items: [] } });

         await user.save();
         res.redirect('/auth/login#login');
         await transporter.sendMail(registrationEmail(email));
      }
   } catch (e) {
      console.error(e);
   }
});

module.exports = router;