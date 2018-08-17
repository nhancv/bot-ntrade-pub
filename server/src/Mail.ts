import nodemailer from 'nodemailer'

export default class Mail {
  toArr: string[] = ['nhancv92@gmail.com']
  transporter
  constructor(email, password) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password
      }
    })
  }

  async sendMail(timeStr, content) {
    let mailOptions = {
      from: '"NTrade 👻" <ntrade@gmail.com>',
      to: this.toArr.toString(),
      subject: `[NTrade] Hight signal at ${timeStr}`,
      text: content
    }
    // send mail with defined transport object
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error)
      }
    })
  }
}
