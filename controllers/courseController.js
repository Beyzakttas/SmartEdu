const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');

// KURS OLUŞTURMA
exports.createCourse = async (req, res) => {
    try {
        await Course.create({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            user: req.session.userID // Kursu oluşturan öğretmenin ID'si
        });
        res.status(201).redirect('/courses');
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// TÜM KURSLARI LİSTELEME, ARAMA VE FİLTRELEME
exports.getAllCourses = async (req, res) => {
    try {
        const categorySlug = req.query.categories;
        const query = req.query.search;
        let filter = {};

        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug });
            if (category) filter = { category: category._id };
        }

        if (query) {
            filter = { name: query };
        }

        const courses = await Course.find({
            $or: [
                { name: { $regex: '.*' + (filter.name || "") + '.*', $options: 'i' } },
                { category: filter.category }
            ]
        }).sort('-createdAt').populate('user');

        const categories = await Category.find();

        res.status(200).render('courses', {
            courses,
            categories,
            page_name: 'courses',
        });
    } catch (error) {
        res.status(400).send("Hata oluştu: " + error.message);
    }
};

// TEKİL KURS SAYFASI
exports.getCourse = async (req, res) => {
    try {
        // user bilgisini populate ederek isme erişimi açıyoruz
        const course = await Course.findOne({ slug: req.params.slug }).populate('user');
        const categories = await Category.find();
        
        // Giriş yapmış kullanıcıyı session'dan buluyoruz (EJS'deki user kontrolü için)
        let user = null;
        if (req.session.userID) {
            user = await User.findById(req.session.userID);
        }

        res.status(200).render('course', {
            course,
            categories,
            user,
            page_name: 'courses',
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// KURS KAYIT (ENROLL) İŞLEMİ
exports.enrollCourse = async (req, res) => {
    try {
        const user = await User.findById(req.session.userID);
        if (!user.courses.includes(req.body.course_id)) {
            await user.courses.push({ _id: req.body.course_id });
            await user.save();
        }
        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).json({ status: 'fail', error });
    }
};

// KURS BIRAKMA (RELEASE) İŞLEMİ
exports.releaseCourse = async (req, res) => {
    try {    
        const user = await User.findById(req.session.userID);
        await user.courses.pull({ _id: req.body.course_id });
        await user.save();
        res.status(200).redirect('/users/dashboard');
    } catch (error) {
        res.status(400).json({ status: 'fail', error });
    }
};