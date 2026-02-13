const Course = require('../models/Course');
const Category = require('../models/Category');

// KURS OLUŞTURMA
exports.createCourse = async (req, res) => {
  try {

    console.log(req.body);
    const course = await Course.create(req.body);

    console.log(req.body)
    // HATA BURADAYDI: Kategori oluşturmak için Course.create değil Category.create kullanılır.
    // Ancak kurs oluştururken kategori oluşturulmaz, kurs bir kategoriye bağlanır.
    res.status(201).json({
      status: 'success',
      course
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// TÜM KURSLARI LİSTELEME
exports.getAllCourses = async (req, res) => {
  try {
    const categorySlug = req.query.categories;
    let filter = {};

    // Eğer bir kategori slug'ı gönderilmişse
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });

      if (category) {
        filter = { category: category._id }; // Kategori bulunduysa filtrele
      } else {
        // Kategori bulunamazsa (veya slug yanlışsa) boş döner
        filter = { category: null };
      }
    }

    const courses = await Course.find(filter);
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
    const course = await Course.findOne({ slug: req.params.slug });

    res.status(200).render('course', {
      course,
      page_name: 'courses',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};