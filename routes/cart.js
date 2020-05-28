const { Router } = require('express');
const router = Router();

const Course = require('../models/course');
const auth = require('../middleware/auth');

router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);

    res.redirect('/cart');
});

router.get('/', auth, async (req, res) => {
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();
    const courses = user.cart.items.map(({ courseId, count }) => ({ ...courseId._doc, count, id: courseId.id }));
    const price = courses.reduce((total, course) => total += course.price * course.count, 0);

    res.render('cart', {
        title: 'Cart',
        isCart: true,
        courses,
        price
    });
});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();
    const courses = user.cart.items.map(({ courseId, count }) => ({ ...courseId._doc, count, id: courseId.id }));
    const price = courses.reduce((total, course) => total += course.price * course.count, 0);

    res.status(200).json({ courses, price });
});

module.exports = router;
