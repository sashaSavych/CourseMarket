const {Router} = require('express');
const router = Router();

const Course = require('../models/course');

router.get('/', (req, res) => {
  res.render('add', {
    title: 'Add course',
    isAdd: true
  })
});

router.post('/', async (req, res) => {
  const { body: { title, price, img } } = req;
  const course = new Course(title, price, img);

  await course.save();

  res.redirect('/courses')
});

module.exports = router;