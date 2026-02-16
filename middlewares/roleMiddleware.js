module.exports = (roles) => {
  return (req, res, next) => {
    // res.locals.user objesinin varlığından ve içinde role olduğundan emin olalım
    const userRole = res.locals.user ? res.locals.user.role : null;

    // Hata ayıklama için terminale yazdıralım (Sorun çözülünce silebilirsin)
    console.log("Gerekli Rol:", roles);
    console.log("Kullanıcının Rolü:", userRole);

    if (roles.includes(userRole)) {
      next();
    } else {
      // Eğer yetki yoksa kullanıcıyı bilgilendir
      return res.status(403).send('Bunu yapmak için yetkiniz yok!');
    }
  };
};