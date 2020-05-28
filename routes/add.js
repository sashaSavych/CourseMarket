const { Router } = require('express');
const router = Router();

const Course = require('../models/course');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Add course',
    isAdd: true
  })
});

router.post('/', auth, async (req, res) => {
  const { body: { title, price, img }, us } = req;
  const course = new Course({ title, price, img, userId: req.user });

  try {
    await course.save();
    res.redirect('/courses');
  } catch (e) {
    console.error(e);
  }
});

module.exports = router;