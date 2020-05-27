const { Router } = require('express');
const router = Router();

const User = require('../models/user');

router.get('/login', async (req, res) => {
   res.render('auth/login', {
      title: 'Authorization',
      isLogin: true
   });
});

router.post('/login', async (req, res) => {
   req.session.user = await User.findById('5ece13d8affab42a44ca6830');
   req.session.isAuthenticated = true;

   req.session.save(err => {
      if (err) {
         throw err;
      } else {
         res.redirect('/');
      }
   });
});

router.get('/logout', async (req, res) => {
   req.session.destroy(() => {
      res.redirect('/auth/login#login');
   });
});

module.exports = router;