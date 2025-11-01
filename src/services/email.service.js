const nodemailer = require('nodemailer');
const config = require('../config/env');

console.log(config.smtp);

// Helper function to generate professional email footer
const getEmailFooter = () => {
  return `
Thank you for choosing Zarafet — Effortlessly Refined

Team Zarafet:
WhatsApp: +447494930922
Website: zarafet.uk
Instagram: @zarafet.uk
TikTok: @zarafet.uk
  `;
};

// Helper function to generate professional HTML email footer
const getEmailFooterHTML = () => {
  return `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #333; font-size: 14px; line-height: 1.8;">
            <p style="margin: 0 0 15px 0;">Thank you for choosing Zarafet — Effortlessly Refined</p>
            <p style="margin: 0 0 10px 0; font-weight: 600;">Team Zarafet:</p>
            <p style="margin: 2px 0;">WhatsApp: +447494930922</p>
            <p style="margin: 2px 0;">Website: <a href="https://zarafet.uk" style="color: #333; text-decoration: none;">zarafet.uk</a></p>
            <p style="margin: 2px 0;">Instagram: <a href="https://instagram.com/zarafet.uk" style="color: #333; text-decoration: none;">@zarafet.uk</a></p>
            <p style="margin: 2px 0;">TikTok: <a href="https://tiktok.com/@zarafet.uk" style="color: #333; text-decoration: none;">@zarafet.uk</a></p>
        </div>
  `;
};

// Create transporter instance
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'server86.web-hosting.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: config.smtp.email,
      pass: config.smtp.password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send basic email function
const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  // console.log('Sending email to:', to);
  // console.log('Subject:', subject);
  // console.log('Text:', text);
  // console.log('HTML:', html);
  // console.log('Attachments:', attachments);
  try {
    const transporter = createTransporter();
    const message = {
      from: `Zarafet <${config.smtp.email}>`,
      to: to,
      subject: subject,
      text: text,
      html: html || `<p>${text}</p>`,
      attachments: attachments
    };

    const result = await transporter.sendMail(message);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation email function
const sendOrderConfirmation = async ({ userEmail, userName, orderData }) => {
  const { order, items, totals, address } = orderData;

  // Ensure proper formatting of user name (trim and normalize spaces)
  const formattedUserName = (userName || '').trim().replace(/\s+/g, ' ');

  const subject = `Order Confirmation - Order #${order.code}`;

  const text = `
Dear ${formattedUserName},

We're pleased to inform you that your order #${order.code} has been confirmed and is in processing.

You'll receive another update once it's shipped.

If you have any questions regarding your order, please don't hesitate to contact us.

Order Details:

Order Number: ${order.code}
Current Status: Processing

${getEmailFooter()}
    `;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; margin: 0; padding: 0; background-color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .content { padding: 0; }
        p { font-size: 16px; margin-bottom: 20px; line-height: 1.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <p>Dear ${formattedUserName},</p>
            
            <p>We're pleased to inform you that your order #${order.code} has been confirmed and is in processing.</p>
            
            <p>You'll receive another update once it's shipped.</p>
            
            <p>If you have any questions regarding your order, please don't hesitate to contact us.</p>
            
            <p><strong>Order Details:</strong></p>
            
            <p>Order Number: ${order.code}<br>
            Current Status: Processing</p>
            
            ${getEmailFooterHTML()}
        </div>
    </div>
</body>
</html>
    `;

  return await sendEmail({
    to: userEmail,
    subject: subject,
    text: text,
    html: html
  });
};

// Send order status update email function
const sendOrderStatusUpdate = async ({ userEmail, userName, orderData, newStatus }) => {
  const { order } = orderData;

  // Ensure proper formatting of user name (trim and normalize spaces)
  const formattedUserName = (userName || '').trim().replace(/\s+/g, ' ');

  // Format status message based on status
  let statusMessage = '';
  if (newStatus.toLowerCase() === 'shipped') {
    statusMessage = `We're pleased to inform you that your order #${order.code} has been shipped and will be delivered to you soon.`;
  } else if (newStatus.toLowerCase() === 'processing') {
    statusMessage = `We're pleased to inform you that your order #${order.code} has been confirmed and is in processing.`;
  } else {
    statusMessage = `Your order #${order.code} status has been updated.`;
  }

  const subject = `Order Update - Order #${order.code}`;

  const text = `
Dear ${formattedUserName},

${statusMessage}

If you have any questions regarding your order, please don't hesitate to contact us.

Order Details:

Order Number: ${order.code}
Current Status: ${newStatus}
${getEmailFooter()}
    `;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; margin: 0; padding: 0; background-color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .content { padding: 0; }
        p { font-size: 16px; margin-bottom: 20px; line-height: 1.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <p>Dear ${formattedUserName},</p>
            
            <p>${statusMessage}</p>
            
            <p>If you have any questions regarding your order, please don't hesitate to contact us.</p>
            
            <p><strong>Order Details:</strong></p>
            
            <p>Order Number: ${order.code}<br>
            Current Status: ${newStatus}</p>
            
            ${getEmailFooterHTML()}
        </div>
    </div>
</body>
</html>
    `;

  return await sendEmail({
    to: userEmail,
    subject: subject,
    text: text,
    html: html
  });
};

// Send OTP verification email
const sendOTPVerificationEmail = async (user, otpCode) => {
  try {
    const subject = 'Verify Your Email - Zarafet';

    const text = `
Dear ${user.name},

Welcome to Zarafet! Please verify your email address to complete your registration.

Your verification code is: ${otpCode}

This code will expire in 10 minutes.

If you didn't create an account with Zarafet, please ignore this email.

${getEmailFooter()}
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification - Zarafet</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e9ecef; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
        .otp-code { background: #e3f2fd; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #1976d2; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Welcome to Zarafet!</h2>
        </div>
        <div class="content">
            <p>Dear ${user.name},</p>
            <p>Please verify your email address to complete your registration.</p>
            
            <div class="otp-code">${otpCode}</div>
            
            <div class="warning">
                <strong>Important:</strong> This code will expire in 10 minutes.
            </div>
            
            <p>If you didn't create an account with Zarafet, please ignore this email.</p>
        </div>
        ${getEmailFooterHTML()}
    </div>
</body>
</html>
    `;

    return await sendEmail({
      to: user.email,
      subject: subject,
      text: text,
      html: html
    });
  } catch (error) {
    console.error('❌ Failed to send OTP verification email:', error.message);
    throw error;
  }
};

// Send password reset OTP email
const sendPasswordResetEmail = async (user, otpCode) => {
  try {
    const subject = 'Password Reset - Zarafet';

    const text = `
Dear ${user.name},

You requested to reset your password. Please use the following code to reset your password:

Your reset code is: ${otpCode}

This code will expire in 10 minutes.

If you didn't request a password reset, please ignore this email.

${getEmailFooter()}
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset - Zarafet</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e9ecef; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666; }
        .otp-code { background: #fff3cd; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #856404; }
        .warning { background: #f8d7da; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Password Reset Request</h2>
        </div>
        <div class="content">
            <p>Dear ${user.name},</p>
            <p>You requested to reset your password. Please use the following code to reset your password:</p>
            
            <div class="otp-code">${otpCode}</div>
            
            <div class="warning">
                <strong>Important:</strong> This code will expire in 10 minutes.
            </div>
            
            <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
        ${getEmailFooterHTML()}
    </div>
</body>
</html>
    `;

    return await sendEmail({
      to: user.email,
      subject: subject,
      text: text,
      html: html
    });
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    throw error;
  }
};

// Send contact form email function (sends to both user and admin)
const sendContactEmail = async ({ firstName, lastName, email, phone, orderNumber, subject, message }) => {
  try {
    // Ensure proper spacing between first and last name
    const first = (firstName || '').trim();
    const last = (lastName || '').trim();
    const fullName = [first, last].filter(Boolean).join(' ');
    
    // Email to admin
    const adminSubject = `Contact Form: ${subject} - ${fullName}`;
    const adminText = `
New Contact Form Submission:

Name: ${fullName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Order Number: ${orderNumber || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Zarafet contact form at ${new Date().toLocaleString()}
    `;

    const adminHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Submission</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .contact-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .message-box { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .label { font-weight: bold; color: #2c3e50; }
        .value { color: #555; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>Someone has contacted you through the Zarafet website</p>
        </div>
        
        <div class="contact-details">
            <h2>Contact Information</h2>
            <div style="margin-bottom: 10px;">
                <span class="label">Name:</span> 
                <span class="value">${fullName}</span>
            </div>
            <div style="margin-bottom: 10px;">
                <span class="label">Email:</span> 
                <span class="value">${email}</span>
            </div>
            <div style="margin-bottom: 10px;">
                <span class="label">Phone:</span> 
                <span class="value">${phone || 'Not provided'}</span>
            </div>
            <div style="margin-bottom: 10px;">
                <span class="label">Order Number:</span> 
                <span class="value">${orderNumber || 'Not provided'}</span>
            </div>
            <div style="margin-bottom: 10px;">
                <span class="label">Subject:</span> 
                <span class="value">${subject}</span>
            </div>
        </div>
        
        <div class="message-box">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
        </div>
        
        <div class="footer">
            <p>This message was sent from the Zarafet contact form at ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
    `;

    // Email to user (confirmation)
    const userSubject = `Thank You for Contacting Zarafet - ${subject}`;
    const userText = `
Dear ${fullName},

Thank you for contacting Zarafet. We have received your message and will get back to you soon.

Your Message Details:
Subject: ${subject}
${orderNumber ? `Order Number: ${orderNumber}` : ''}

We aim to respond to all inquiries within 24-48 hours.

${getEmailFooter()}
    `;

    const userHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Us</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
        .content { padding: 0 20px; }
        .greeting { font-size: 16px; margin-bottom: 25px; }
        .message { font-size: 16px; margin-bottom: 30px; line-height: 1.8; }
        .details-section { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .details-section h3 { margin-top: 0; margin-bottom: 15px; font-size: 18px; color: #333; }
        .detail-item { margin: 10px 0; font-size: 15px; }
        .detail-label { font-weight: bold; color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <p class="greeting">Dear ${fullName},</p>
            
            <p class="message">
                Thank you for contacting Zarafet. We have received your message and will get back to you soon.
            </p>
            
            <div class="details-section">
                <h3>Your Message Details:</h3>
                <div class="detail-item">
                    <span class="detail-label">Subject:</span> ${subject}
                </div>
                ${orderNumber ? `
                <div class="detail-item">
                    <span class="detail-label">Order Number:</span> ${orderNumber}
                </div>
                ` : ''}
            </div>
            
            <p class="message">
                We aim to respond to all inquiries within 24-48 hours.
            </p>
            
            ${getEmailFooterHTML()}
        </div>
    </div>
</body>
</html>
    `;

    // Send email to admin
    const adminResult = await sendEmail({
      to: config.smtp.email,
      subject: adminSubject,
      text: adminText,
      html: adminHtml
    });

    // Send confirmation email to user
    const userResult = await sendEmail({
      to: email,
      subject: userSubject,
      text: userText,
      html: userHtml
    });

    return {
      success: adminResult.success && userResult.success,
      adminMessageId: adminResult.messageId,
      userMessageId: userResult.messageId
    };
  } catch (error) {
    console.error('❌ Failed to send contact email:', error.message);
    throw error;
  }
};

// Send email subscription confirmation function
const sendSubscriptionConfirmation = async ({ email }) => {
  try {
    const subject = 'Thank You for Subscribing to Zarafet';

    const text = `
Dear Subscriber,

Thank you for subscribing to Zarafet! We're excited to have you join our community.

You'll now receive:
- Exclusive deals and discounts
- New product announcements
- Style tips and updates
- Special offers just for subscribers

We promise to only send you valuable updates and never spam your inbox.

If you have any questions, please don't hesitate to contact us.

${getEmailFooter()}
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Subscribing</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; margin: 0; padding: 0; background-color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .content { padding: 0; }
        p { font-size: 16px; margin-bottom: 20px; line-height: 1.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <p>Dear Subscriber,</p>
            
            <p>Thank you for subscribing to Zarafet! We're excited to have you join our community.</p>
            
            <p>You'll now receive:<br>
            - Exclusive deals and discounts<br>
            - New product announcements<br>
            - Style tips and updates<br>
            - Special offers just for subscribers</p>
            
            <p>We promise to only send you valuable updates and never spam your inbox.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            ${getEmailFooterHTML()}
        </div>
    </div>
</body>
</html>
    `;

    return await sendEmail({
      to: email,
      subject: subject,
      text: text,
      html: html
    });
  } catch (error) {
    console.error('❌ Failed to send subscription confirmation email:', error.message);
    throw error;
  }
};

// Export all functions as an object
module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendOTPVerificationEmail,
  sendPasswordResetEmail,
  sendContactEmail,
  sendSubscriptionConfirmation
};
