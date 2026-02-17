const express = require('express');
const courseController = require('../controllers/courseController');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// KURS OLUŞTURMA: Sadece öğretmen ve admin yapabilir
router.route('/').post(roleMiddleware(["teacher", "admin"]), courseController.createCourse);

// TÜM KURSLARI LİSTELEME
router.route('/').get(courseController.getAllCourses); 

// KURS KAYIT (ENROLL): Yeni eklenen rota
// Bu rotayı tekil kurs rotasından (:slug) önce yazmak çakışmaları önler
router.route('/enroll').post(courseController.enrollCourse);
// routes/courseRoute.js içine ekle
router.route('/release').post(courseController.releaseCourse);
// TEKİL KURS SAYFASI
router.route('/:slug').get(courseController.getCourse); 

// :slug parametresi, gönderdiğin 'c' (veya kursun adı) değerini yakalar
router.route('/:slug').delete(courseController.deleteCourse);
// Method-override sayesinde .put kullanabiliyoruz
router.route('/:slug').put(courseController.updateCourse);
// Sadece öğretmen ve admin kurs silebilir/güncelleyebilir
router.route('/:slug').delete(roleMiddleware(["teacher", "admin"]), courseController.deleteCourse);
router.route('/:slug').put(roleMiddleware(["teacher", "admin"]), courseController.updateCourse);
module.exports = router;