const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const fs = require('fs'); // Dosya işlemleri için gerekli

// KURS OLUŞTURMA
exports.createCourse = async (req, res) => {
    try {
        // Resim yükleme kontrolü
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        let imageName = "blog_1.jpg"; // Varsayılan resim
        if (req.files && req.files.image) {
            let uploadFile = req.files.image;
            imageName = Date.now() + '_' + uploadFile.name; // Çakışma olmaması için tarih ekledik
            let uploadPath = 'public/uploads/' + imageName;

            await uploadFile.mv(uploadPath);
        }

        await Course.create({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            user: req.session.userID,
            image: '/uploads/' + imageName // Resim yolunu DB'ye kaydediyoruz
        });

        req.flash("success", "Course created successfully");
        res.status(201).redirect('/courses');
    } catch (error) {
        req.flash("error", "Course could not be created!");
        res.status(400).redirect('/courses');
    }
};

// KURS GÜNCELLEME (UPDATE) İŞLEMİ
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });

        course.name = req.body.name;
        course.description = req.body.description;
        course.category = req.body.category;

        // GÜVENLİ KONTROL: req.files var mı ve içinde image var mı?
        if (req.files && req.files.image) {
            let uploadFile = req.files.image;
            
            // Buradaki kontrol sayesinde 'name' hatası almazsın
            let imageName = Date.now() + '_' + uploadFile.name; 
            let uploadPath = 'public/uploads/' + imageName;

            if (!fs.existsSync('public/uploads')) {
                fs.mkdirSync('public/uploads', { recursive: true });
            }

            await uploadFile.mv(uploadPath);
            course.image = '/uploads/' + imageName;
        }

        await course.save();
        req.flash("success", `${course.name} updated successfully`);
        res.status(200).redirect('/users/dashboard');

    } catch (error) {
        console.error("GÜNCELLEME HATASI:", error);
        req.flash("error", "Update failed: " + error.message);
        res.status(400).redirect('/users/dashboard');
    }
};
// Diğer fonksiyonlar (getAllCourses, getCourse, enroll, release, delete) 
// senin gönderdiğin şekilde kalabilir, onlar zaten doğru çalışıyor.
exports.getAllCourses = async (req, res) => {
    try {
        const categorySlug = req.query.categories;
        const query = req.query.search;
        
        let filter = {};

        // 1. Kategori Filtresi: Sadece kategori seçilmişse çalışsın
        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug });
            if (category) {
                filter.category = category._id;
            }
        }

        // 2. Arama Filtresi: Sadece arama yapılmışsa çalışsın
        if (query) {
            // "i" seçeneği büyük/küçük harf duyarlılığını kaldırır
            filter.name = { $regex: query, $options: 'i' };
        }

        const courses = await Course.find(filter).sort('-createdAt').populate('user');
        const categories = await Category.find();

        res.status(200).render('courses', {
            courses,
            categories,
            page_name: 'courses',
        });
    } catch (error) {
        // Hata durumunda konsola yazdır ki ne olduğunu görelim
        console.log("Filtreleme Hatası: ", error);
        res.status(400).redirect('/courses');
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
// KURS SİLME (DELETE) İŞLEMİ
exports.deleteCourse = async (req, res) => {
    try {    
        // Slug üzerinden kursu bulup siliyoruz
        const course = await Course.findOneAndDelete({slug:req.params.slug});

        // Kullanıcıya bilgi mesajı gönderiyoruz
        req.flash("error", `${course.name} has been removed successfully`);

        res.status(200).redirect('/users/dashboard');

    } catch (error) {
        res.status(400).json({
            status: 'fail',
            error,
        });
    }
};