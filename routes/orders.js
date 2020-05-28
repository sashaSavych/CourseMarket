const { Router } = require('express');
const router = Router();

const Order = require('../models/order');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order
            .find({ 'user.userId': req.user._id})
            .populate('user.userId');

        res.render('orders', {
            isOrder: true,
            title: 'Orders',
            orders: orders.map(order => ({
                ...order._doc,
                price: order.courses.reduce((total, course) => total += course.count * course.course.price, 0)
            }))
        });
    } catch (e) {
        console.error(e);
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user
            .populate('cart.items.courseId')
            .execPopulate();
        const courses = user.cart.items.map(({ count, courseId }) => ({ count, course: courseId._doc }));
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses
        });

        await order.save();
        await req.user.clearCart();

        res.redirect('/orders');
    } catch (e) {
        console.error(e);
    }
});

module.exports = router;