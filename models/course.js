const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class Course {
    constructor(title, price, img) {
        this.id = uuidv4();
        this.title = title;
        this.price = price;
        this.img = img;
    }

    async save() {
        const courses = await Course.getAll();
        courses.push(this.getCurrentCourse());

        return new Promise((resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, '..', 'data', 'courses.json'),
                JSON.stringify(courses),
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    getCurrentCourse() {
        return {
            id: this.id,
            title: this.title,
            price: this.price,
            img: this.img
        };
    }

    static getAll() {
        return new Promise((resolve, reject) => {
            fs.readFile(
                path.join(__dirname, '..', 'data', 'courses.json'),
                'utf8',
                (err, content) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(JSON.parse(content));
                    }
                }
            );
        });
    }

    static async getById(courseId) {
        const courses = await Course.getAll();

        return courses.find(({ id }) => id === courseId) || null;
    }

    static async updateById(course) {
        const courses = await Course.getAll();
        const index = courses.findIndex(({ id }) => course.id === id);
        courses[index] = course;

        return new Promise((resolve, reject) => {
            fs.writeFile(
                path.join(__dirname, '..', 'data', 'courses.json'),
                JSON.stringify(courses),
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
}

module.exports = Course;