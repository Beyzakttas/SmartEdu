const express = require('express');
const courseController = require('../controllers/courseController');
const roleMiddleware = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware'); // 1. Middleware'i içe aktar

const router = express.Router();

// TÜM KURSLARI LİSTELEME - Herkese açık kalabilir
router.route('/').get(courseController.getAllCourses); 

// KURS OLUŞTURMA: Önce giriş yapmış mı (auth), sonra yetkisi var mı (role) kontrolü
router.route('/').post(authMiddleware, roleMiddleware(["teacher", "admin"]), courseController.createCourse);

// KURS KAYIT (ENROLL) VE BIRAKMA (RELEASE)
// Bu işlemleri sadece giriş yapmış kullanıcılar yapabilmeli
router.route('/enroll').post(authMiddleware, courseController.enrollCourse); // 2. Korumaya alındı

router.route('/release').post(authMiddleware, courseController.releaseCourse); // 2. Korumaya alındı

// TEKİL KURS SAYFASI - Herkese açık kalabilir
router.route('/:slug').get(courseController.getCourse); 

// KURS SİLME VE GÜNCELLEME
// Önce giriş kontrolü, sonra rol kontrolü
router.route('/:slug').delete(authMiddleware, roleMiddleware(["teacher", "admin"]), courseController.deleteCourse);
router.route('/:slug').put(authMiddleware, roleMiddleware(["teacher", "admin"]), courseController.updateCourse);

module.exports = router;