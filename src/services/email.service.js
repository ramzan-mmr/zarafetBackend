const nodemailer = require('nodemailer');
const config = require('../config/env');

console.log(config.smtp);

// Create transporter instance
const createTransporter = () => {
  return nodemailer.createTransport({
    // service: 'gmail',
    host: 'smtpout.secureserver.net',
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

  const subject = `Order Confirmation - Order #${order.code}`;

  const text = `
Order Details:
- Order Number: ${order.code}
- Order Date: ${new Date(order.created_at).toLocaleDateString()}
- Total Amount: ${config.currency.symbol}${totals.total.toFixed(2)}

Items Ordered:
${items.map(item => `- ${item.product_name} (${item.variant_name || 'Standard'})${item.selected_fit ? ` - Fit: ${item.selected_fit}` : ''} x ${item.quantity} - ${config.currency.symbol}${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}`).join('\n')}

Order Summary:
- Subtotal: ${config.currency.symbol}${totals.subtotal.toFixed(2)}
- Shipping: ${config.currency.symbol}${totals.shipping.toFixed(2)}
${orderData.promoCode ? `- Discount (${orderData.promoCode.code}): -${config.currency.symbol}${orderData.promoCode.discountAmount.toFixed(2)}` : ''}
- Total: ${config.currency.symbol}${totals.total.toFixed(2)}
${orderData.promoCode ? `- You saved ${config.currency.symbol}${orderData.promoCode.discountAmount.toFixed(2)} with promo code ${orderData.promoCode.code}!` : ''}

Shipping Address:
${address.line1}
${address.line2 ? address.line2 + '\n' : ''}${address.city}, ${address.postal_code}
Phone: ${address.phone}
    `;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .order-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .order-summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .item:last-child { border-bottom: none; }
        .total { font-weight: bold; font-size: 18px; color: #28a745; }
        .address { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
        </div>
        
        <div class="order-details">
            <h2>Order Information</h2>
            <div class="order-summary">
                <p><strong>Order Number:</strong> ${order.code}</p>
                <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${order.status_name || 'Processing'}</p>
            </div>
            
            <h3>Items Ordered</h3>
            ${items.map(item => `
                <div class="item">
                    <strong>${item.product_name}</strong>
                    ${item.variant_name ? `<br><small>Variant: ${item.variant_name}</small>` : ''}
                    ${item.selected_fit ? `<br><small>Fit: ${item.selected_fit}</small>` : ''}
                    <br>Quantity: ${item.quantity} × ${config.currency.symbol}${parseFloat(item.unit_price).toFixed(2)} = ${config.currency.symbol}${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                </div>
            `).join('')}
            
            <div class="order-summary">
                <p><strong>Subtotal:</strong> ${config.currency.symbol}${totals.subtotal.toFixed(2)}</p>
                <p><strong>Shipping:</strong> ${config.currency.symbol}${totals.shipping.toFixed(2)}</p>
                ${orderData.promoCode ? `
                    <p style="color: #28a745; font-weight: bold;">
                        <strong>Discount (${orderData.promoCode.code}):</strong> -${config.currency.symbol}${orderData.promoCode.discountAmount.toFixed(2)}
                    </p>
                ` : ''}
                <p class="total"><strong>Total:</strong> ${config.currency.symbol}${totals.total.toFixed(2)}</p>
                ${orderData.promoCode ? `
                    <p style="color: #28a745; font-size: 14px; margin-top: 5px;">
                        You saved ${config.currency.symbol}${orderData.promoCode.discountAmount.toFixed(2)} with promo code ${orderData.promoCode.code}!
                    </p>
                ` : ''}
            </div>
        </div>
        
        <div class="address">
            <h3>Shipping Address</h3>
            <p>
                ${address.line1}<br>
                ${address.line2 ? address.line2 + '<br>' : ''}
                ${address.city}, ${address.postal_code}<br>
                <strong>Phone:</strong> ${address.phone}
            </p>
        </div>
        
        <div class="footer">
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

  const subject = `Order Update - Order #${order.code}`;

  const text = `
Order Details:
- Order Number: ${order.code}
- New Status: ${newStatus}
    `;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .status-update { background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Order Status Update</h1>
        </div>
        
        <div class="status-update">
            <h2>Order Status Update</h2>
            <p><strong>Order Number:</strong> ${order.code}</p>
            <p><strong>New Status:</strong> ${newStatus}</p>
        </div>
        
        <div class="footer">
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

Best regards,
Zarafet Team
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
        <div class="footer">
            <p>Best regards,<br>Zarafet Team</p>
        </div>
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

Best regards,
Zarafet Team
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
        <div class="footer">
            <p>Best regards,<br>Zarafet Team</p>
        </div>
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

// Send contact form email function
const sendContactEmail = async ({ firstName, lastName, email, phone, orderNumber, subject, message }) => {
  try {
    const fullName = `${firstName} ${lastName}`;
    const subjectLine = `Contact Form: ${subject} - ${fullName}`;

    const text = `
Contact Form Submission:

Name: ${fullName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Order Number: ${orderNumber || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Zarafet contact form.
    `;

    const html = `
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

    return await sendEmail({
      to: config.smtp.email, // Send to your business email
      subject: subjectLine,
      text: text,
      html: html
    });
  } catch (error) {
    console.error('❌ Failed to send contact email:', error.message);
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
  sendContactEmail
};
