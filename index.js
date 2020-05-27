const express = require('express');
const path = require('path');
const expressHandlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');

const homeRoutes = require('./routes/home');
const cartRoutes = require('./routes/cart');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const User = require('./models/user');

const app = express();

app.engine('hbs', expressHandlebars({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  defaultLayout: 'main',
  extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (req, res, next) => {
  try {
    const user = await User.findById('5ece13d8affab42a44ca6830');
    req.user = user;
    next();
  } catch (e) {
    console.error(e);
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);

async function start() {
  try {
    const mongoDBUrl = 'mongodb+srv://course-market-user:xmCfucpUGvivKEsx@cluster0-zxqn8.mongodb.net/courseMarket';
    await mongoose.connect(mongoDBUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });

    const userCandidate = await User.findOne();
    if (!userCandidate) {
      const user = new User({
        email: 'osavych@gmail.com',
        name: 'Sasha',
        cart: { items: [] }
      });

      await user.save();
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    });
  } catch (e) {
    console.error(e);
  }
}
start();