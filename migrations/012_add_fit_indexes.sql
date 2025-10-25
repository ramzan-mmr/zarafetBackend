-- Create indexes for fit-related fields
CREATE INDEX idx_products_fit_required ON products(fit_required);
CREATE INDEX idx_order_items_fit ON order_items(selected_fit);
