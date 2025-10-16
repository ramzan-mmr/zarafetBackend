const nodemailer = require('nodemailer');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 465,
      secure: true,
      auth: {
        user: config.smtp.email,
        pass: config.smtp.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail({ to, subject, text, html, attachments = [] }) {
    try {
      const message = {
        from: `Zarafet <${config.smtp.email}>`,
        to: to,
        subject: subject,
        text: text,
        html: html || `<p>${text}</p>`,
        attachments: attachments
      };

      const result = await this.transporter.sendMail(message);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendOrderConfirmation({ userEmail, userName, orderData }) {
    const { order, items, totals, address } = orderData;

    const subject = `Order Confirmation - Order #${order.code}`;

    const text = `
Dear ${userName},

Thank you for your order! We have received your order and it is being processed.

Order Details:
- Order Number: ${order.code}
- Order Date: ${new Date(order.created_at).toLocaleDateString()}
- Total Amount: $${totals.total.toFixed(2)}

Items Ordered:
${items.map(item => `- ${item.product_name} (${item.variant_name || 'Standard'}) x ${item.quantity} - $${(item.unit_price * item.quantity).toFixed(2)}`).join('\n')}

Shipping Address:
${address.line1}
${address.line2 ? address.line2 + '\n' : ''}${address.city}, ${address.postal_code}
Phone: ${address.phone}

We will send you another email when your order ships.

Thank you for choosing Zarafet!

Best regards,
Zarafet Team
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
            <h1>🎉 Order Confirmation</h1>
            <p>Thank you for your order, ${userName}!</p>
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
                    <br>Quantity: ${item.quantity} × $${item.unit_price.toFixed(2)} = $${(item.unit_price * item.quantity).toFixed(2)}
                </div>
            `).join('')}
            
            <div class="order-summary">
                <p><strong>Subtotal:</strong> $${totals.subtotal.toFixed(2)}</p>
                <p><strong>Tax:</strong> $${totals.tax.toFixed(2)}</p>
                <p><strong>Shipping:</strong> $${totals.shipping.toFixed(2)}</p>
                <p class="total"><strong>Total:</strong> $${totals.total.toFixed(2)}</p>
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
            <p>We will send you another email when your order ships.</p>
            <p>Thank you for choosing Zarafet!</p>
            <p><strong>Zarafet Team</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: subject,
      text: text,
      html: html
    });
  }

  async sendOrderStatusUpdate({ userEmail, userName, orderData, newStatus }) {
    const { order } = orderData;

    const subject = `Order Update - Order #${order.code}`;

    const text = `
Dear ${userName},

Your order status has been updated.

Order Details:
- Order Number: ${order.code}
- New Status: ${newStatus}

We will keep you updated on any further changes to your order.

Thank you for choosing Zarafet!

Best regards,
Zarafet Team
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
            <h2>Hello ${userName}!</h2>
            <p>Your order status has been updated:</p>
            <p><strong>Order Number:</strong> ${order.code}</p>
            <p><strong>New Status:</strong> ${newStatus}</p>
        </div>
        
        <div class="footer">
            <p>We will keep you updated on any further changes to your order.</p>
            <p>Thank you for choosing Zarafet!</p>
            <p><strong>Zarafet Team</strong></p>
        </div>
    </div>
</body>
</html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: subject,
      text: text,
      html: html
    });
  }
}

module.exports = new EmailService();
