import nodemailer from 'nodemailer';

export default class Mail {
  toArr: string[] = require('./secret.json').recipients;
  transporter;
  constructor(email, password) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password
      }
    });
  }

  async sendMail(symbol, timeStr, content) {
    let mailOptions = {
      from: '"NTrade 👻" <ntrade@gmail.com>',
      to: this.toArr.toString(),
      subject: `[NTrade: ${symbol.toUpperCase()}] Hight signal at ${timeStr}`,
      text: content
    };
    // send mail with defined transport object
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
    });
  }
}
