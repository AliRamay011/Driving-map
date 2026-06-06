import nodemailer from "nodemailer";
import 'dotenv/config';

export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
port: 2525, // ya 2525 bhi use kar sakte ho
  auth: {
    user: "8a9bb1f7978748", // Mailtrap username
    pass: "8daecc554c249e",     // Mailtrap password / API token
  }
});

// SMTP connection test
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP Connection Error:", err.message);
  } else {
    console.log("✅ SMTP Server is ready to take messages");
  }
});


