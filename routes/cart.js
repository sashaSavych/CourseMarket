const { Router } = require('express');
const router = Router();

const Cart = require('../models/cart');
const Course = require('../models/course');

router.post('/add', async (req, res) => {
    const course = await Course.getById(req.body.id);
    await Cart.addItem(course);

    res.redirect('/cart');
});

router.get('/', async (req, res) => {
    const cart = await Cart.getState();
    res.render('cart', {
        title: 'Cart',
        isCart: true,
        ...cart
    });
});

router.delete('/remove/:id', async (req, res) => {
   const cart =  await Cart.removeItem(req.params.id);
   res.status(200).json(cart);
});

module.exports = router;
