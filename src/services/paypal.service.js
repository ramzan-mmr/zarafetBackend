const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const config = require('../config/env');

function environment() {
  return config.paypal.mode === 'live'
    ? new checkoutNodeJssdk.core.LiveEnvironment(
        config.paypal.clientId,
        config.paypal.clientSecret
      )
    : new checkoutNodeJssdk.core.SandboxEnvironment(
        config.paypal.clientId,
        config.paypal.clientSecret
      );
}

const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment());


/**
 * Helper function to capture a PayPal order by ID.
 * @param {string} orderID - The PayPal order ID to capture.
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
const capturePaypalOrder = async (orderID) => {
  try {
    if (!orderID) {
      return {
        success: false,
        error: 'ORDER_ID_REQUIRED',
        message: 'PayPal orderID is required'
      };
    }

    // 1️⃣ Capture payment in PayPal
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client.execute(request);

    if (capture.result.status !== 'COMPLETED') {
      return {
        success: false,
        error: 'PAYPAL_CAPTURE_FAILED',
        message: 'Payment not completed'
      };
    }

    return {
      success: true,
      data: capture?.result
    };
  } catch (error) {
    console.error('❌ PayPal capture error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to capture PayPal order',
      details: error.message
    };
  }
};



module.exports = {
  client,
  checkoutNodeJssdk,
  capturePaypalOrder
};
