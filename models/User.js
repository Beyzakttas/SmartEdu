const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
 password: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // En az 8 karakter VE en az bir özel karakter (Regex)
        return /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(v);
      },
      message: props => `Şifre en az 8 karakter olmalı ve en az bir özel karakter içermelidir!`
    }
  },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student"
  },
  // KURS-ÖĞRENCİ İLİŞKİSİ İÇİN EKLENEN ALAN
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course' // Course modeline referans veriyoruz
  }]
});

// Şifre şifreleme middleware'i (Aynı kalıyor)
UserSchema.pre('save', async function () {
    const user = this;
    if (!user.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
    } catch (err) {
        throw err;
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;