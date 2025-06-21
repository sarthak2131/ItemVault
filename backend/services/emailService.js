import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a more robust email transporter with additional configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Use only in development
    }
  });
};

export const sendEnquiryEmail = async (itemDetails, recipientEmail) => {
  try {
    // Validate input
    if (!itemDetails || !itemDetails.itemName) {
      console.error('Invalid item details for enquiry');
      return false;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail || process.env.ADMIN_EMAIL || 'admin@itemmanagement.com',
      subject: `New Enquiry for Item: ${itemDetails.itemName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Item Enquiry Received</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Item Name:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${itemDetails.itemName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Item Type:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${itemDetails.itemType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Description:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${itemDetails.description}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #666;">This is an automated enquiry notification.</p>
        </div>
      `,
      text: `
        Item Enquiry Received
        Item Name: ${itemDetails.itemName}
        Item Type: ${itemDetails.itemType}
        Description: ${itemDetails.description}
      `
    };

    // Send email with additional error handling
    const info = await transporter.sendMail(mailOptions);
    console.log('Enquiry email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Detailed email sending error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response
    });
    return false;
  }
};