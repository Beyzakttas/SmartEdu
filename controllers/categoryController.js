const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
try {
const category =await Category.create(req.body);
res.status(201).json({
status: 'success',
category,
});
} catch (error) {
res.status (400).json({
status: 'fail',
error,
});
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).redirect('/users/dashboard'); // API yerine dashboard'a dönebiliriz
  } catch (error) {
    res.status(400).json({ status: 'fail', error });
  }
};

// KATEGORİ SİLME (DELETE) İŞLEMİ
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

// KATEGORİ OLUŞTURMA
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).redirect('/users/dashboard'); // İşlem bitince dashboard'a dön
  } catch (error) {
    res.status(400).json({ status: 'fail', error });
  }
};

// KATEGORİ SİLME
exports.deleteCategory = async (req, res) => {
  try {    
    await Category.findByIdAndDelete(req.params.id); // findByIdAndRemove yerine güncel metod
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({ status: 'fail', error });
  }
};