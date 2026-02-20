const mongoose = require('mongoose');
const slugify = require('slugify');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  name: {
    type: String,
    // unique: true kuralını kaldırıyoruz, güncelleme hatalarını önlemek için
    required: true, 
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: '/images/blog_1.jpg'
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
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }
});

// BURASI KRİTİK: next parametresini sildik ve async yaptık
CourseSchema.pre('validate', async function() {
  if (this.name) {
    let baseSlug = slugify(this.name, {
      lower: true,
      strict: true
    });

    const uniqueId = Math.random().toString(36).substring(2, 6);
    this.slug = baseSlug ? `${baseSlug}-${uniqueId}` : `course-${uniqueId}`;
  }
  // async olduğu için next() demene gerek yok, otomatik devam eder.
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;