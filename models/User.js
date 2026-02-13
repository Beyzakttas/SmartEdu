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
  }
});

// 'next' parametresini kaldırdık, async yapı kendi akışını yönetir
UserSchema.pre('save', async function () {
    const user = this;

    // Şifre değişmediyse fonksiyondan çık (kaydetmeye devam eder)
    if (!user.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        // next() çağırmaya gerek yok, async tamamlanınca otomatik ilerler
    } catch (err) {
        throw err; // Hata varsa fırlat, controller'daki catch bunu yakalar
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;