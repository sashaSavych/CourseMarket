const { Router } = require('express');
const router = Router();
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const nodemailerST = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const User = require('../models/user');
const keys = require('../keys');
const transporter = nodemailer.createTransport(nodemailerST({ auth: { api_key: keys.SEND_GRID_API_KEY }}));
const registrationEmail = require('../emails/registration');
const resetPasswordEmail = require('../emails/reset-password');

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

router.get('/reset', (req, res) => {
   res.render('auth/reset-password', {
      title: 'Reset password'
   })
});

router.post('/reset', async (req, res) => {
   try {
      crypto.randomBytes(32, async (err, buf) => {
         if (err) {
            return res.redirect('/auth/reset');
         }

         const token = buf.toString('hex');
         const candidateByEmail = await User.findOne({ email: req.body.email });

         if (candidateByEmail) {
            candidateByEmail.resetToken = token;
            candidateByEmail.resetTokenExpDate = Date.now() + 60 * 60 * 1000;
            await candidateByEmail.save();
            res.redirect('/auth/login');
            await transporter.sendMail(resetPasswordEmail(candidateByEmail.email, token));
         } else {
            req.flash('error', 'Such email has not been found');
            res.redirect('/auth/reset');
         }
      })
   } catch (e) {
      console.error(e);
   }
});

router.get('/new-password/:token', async (req, res) => {
   try {
      const resetToken = req.params.token;

      if (!resetToken) {
         return res.redirect('/auth/login');
      }

      const user = await User.findOne({
         resetToken,
         resetTokenExpDate: {$gt: Date.now()}
      });

      if (!user) {
         return res.redirect('/auth/login');
      }

      res.render('auth/new-password', {
         title: 'Reset password',
         userId: user._id.toString(),
         token: resetToken
      });
   } catch (e) {
      console.error(e);
   }
});

router.post('/password', async (req, res) => {
   try {
      const user = await User.findOne({
         _id: req.body.userId,
         resetToken: req.body.token,
         resetTokenExpDate: { $gt: Date.now() }
      });

      if (user) {
         user.password = await bcryptjs.hash(req.body.password, 10);
         user.resetToken = user.resetTokenExpDate = null;
         await user.save();
         res.redirect('/auth/login');
      } else {
         res.flash('loginError', 'Token has been expired. Try again later');
         res.redirect('/auth/login');
      }
   } catch (e) {
      console.error(e);
   }
});

module.exports = router;