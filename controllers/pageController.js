const nodemailer = require("nodemailer");

exports.getIndexPage = (req, res) => {
  res.status(200).render('index', {
    page_name: 'index',
  });
};

exports.getAboutPage = (req, res) => {
  res.status(200).render('about', {
    page_name: 'about',
  });
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render('register', {
    page_name: 'register',
  });
};

exports.getLoginPage = (req, res) => {
  res.status(200).render('login', {
    page_name: 'login',
  });
};

exports.getContactPage = (req, res) => {
  res.status(200).render('contact', {
    page_name: 'contact',
  });
};

// Başına "async" eklediğimizden emin olalım
exports.sendEmail = async (req, res) => { 
  try {
    const outputMessage = `
    <h1>Mail Details</h1>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h1>Message</h1>
    <p>${req.body.message}</p>
    `;

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: "denemeornek20@gmail.com", // Kendi mailin
        pass: "suuu ngvw dsoo tnkw", // Uygulama şifren
      },
    });

    // Artık async olduğu için await burada çalışacaktır
    await transporter.sendMail({
      from: '"SmartEDU Contact Form" <BEYZA_ADRESIN@gmail.com>', 
      to: "BEYZA_ADRESIN@gmail.com", 
      subject: "SmartEDU Contact Form New Message", 
      html: outputMessage, 
    });

    req.flash("success", "We Received your message successfully");
    res.status(200).redirect('/contact');

  } catch (err) {
    // Hata durumunda da flash mesajı gönderelim
    req.flash("error", `Something happened: ${err.message}`);
    res.status(200).redirect('/contact');
  }
};

// DOSYANIN SONUNDAKİ FAZLALIK 'let transporter' KODLARINI SİLDİM!