const path = require('path');
const fs = require('fs');

const dataPath = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

class Cart {
    static async addItem(course) {
        const cart = await Cart.getState();
        const index = cart.courses.findIndex(({ id }) => id === course.id);
        const candidate = cart.courses[index];

        if (candidate) {
            candidate.count++;
            cart.courses[index] = candidate;
        } else {
            course.count = 1;
            cart.courses.push(course);
        }

        cart.price += +course.price;

        return new Promise((resolve, reject) => {
           fs.writeFile(dataPath, JSON.stringify(cart), err => {
               if (err) {
                   reject(err);
               } else {
                   resolve();
               }
           })
        });
    }

    static async getState() {
        return new Promise((resolve, reject) => {
            fs.readFile(dataPath, 'utf-8', (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(content));
                }
            })
        });
    }

    static async removeItem(courseId) {
        const cart = await Cart.getState();
        const index = cart.courses.findIndex(({ id }) => id === courseId);
        const course = cart.courses[index];

        if (course.count === 1) {
            cart.courses = cart.courses.filter(({ id }) => id !== courseId);
        } else {
            cart.courses[index].count--;
        }

        cart.price -= course.price;

        return new Promise((resolve, reject) => {
            fs.writeFile(dataPath, JSON.stringify(cart), err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(cart);
                }
            })
        });
    }
}

module.exports = Cart;