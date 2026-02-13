const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('./Category');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  slug: {
    type: String,
    unique: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
});

// Kayıt oluşturulmadan veya güncellenmeden önce slug oluşturma
// next parametresini kaldırıyoruz, Mongoose bunu otomatik yönetir.
CourseSchema.pre('validate', function () {
  if (this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true
    });
  }
  // next(); siliyoruz.
});
const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;