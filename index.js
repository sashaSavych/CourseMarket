const express = require('express');
const path = require('path');
const expressHandlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const MongoStore = require('connect-mongodb-session')(expressSession);

const homeRoutes = require('./routes/home');
const cartRoutes = require('./routes/cart');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const variablesMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const mongoDBUrl = 'mongodb+srv://course-market-user:xmCfucpUGvivKEsx@cluster0-zxqn8.mongodb.net/courseMarket';
const sessionStore = new MongoStore({
  collection: 'sessions',
  uri: mongoDBUrl
});

const app = express();

app.engine('hbs', expressHandlebars({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  defaultLayout: 'main',
  extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.use(expressSession({
  secret: 'some secret value',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));
app.use(variablesMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);

async function start() {
  try {
    await mongoose.connect(mongoDBUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    });
  } catch (e) {
    console.error(e);
  }
}
start();