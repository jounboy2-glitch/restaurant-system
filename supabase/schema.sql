-- RESTAURANT SYSTEM — DATABASE SCHEMA

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner','admin','manager','waiter','kitchen')),
  restaurant_id UUID,
  branch_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  address TEXT,
  phone TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  manager_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  table_number INT NOT NULL,
  qr_code_url TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','occupied','reserved')),
  capacity INT DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, table_number)
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  cost_price NUMERIC(10,2) DEFAULT 0,
  image TEXT,
  is_available BOOLEAN DEFAULT true,
  prep_time INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  customer_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','preparing','ready','delivered','completed','cancelled')),
  total_price NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  waiter_id UUID REFERENCES users(id),
  shift_id UUID,
  amount NUMERIC(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash','telebirr','chapa','card','bank','coupon')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waiter_id UUID REFERENCES users(id),
  branch_id UUID REFERENCES branches(id),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','verified')),
  total_cash NUMERIC(10,2) DEFAULT 0,
  total_telebirr NUMERIC(10,2) DEFAULT 0,
  total_chapa NUMERIC(10,2) DEFAULT 0,
  total_card NUMERIC(10,2) DEFAULT 0,
  expected_total NUMERIC(10,2) DEFAULT 0,
  actual_total NUMERIC(10,2) DEFAULT 0,
  difference NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id),
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  role TEXT,
  action_type TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  amount NUMERIC(10,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  target_role TEXT,
  target_user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_payments_shift ON payments(shift_id);
CREATE INDEX idx_expenses_branch ON expenses(branch_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_notifications_target ON notifications(target_role, is_read);

-- RLS (ለልማት ብቻ — በ production ቀይር!)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_all_users" ON users FOR ALL USING (true);
CREATE POLICY "dev_all_orders" ON orders FOR ALL USING (true);
CREATE POLICY "dev_all_payments" ON payments FOR ALL USING (true);
CREATE POLICY "dev_all_expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "dev_all_categories" ON categories FOR ALL USING (true);
CREATE POLICY "dev_all_menu" ON menu_items FOR ALL USING (true);
CREATE POLICY "dev_all_tables" ON tables FOR ALL USING (true);

-- TEST DATA
INSERT INTO restaurants (id, name, address, phone)
VALUES ('11111111-1111-1111-1111-111111111111', 'ጣይቱ ሪስቶራንት', 'አዲስ አበባ፣ ቦሌ', '+251911234567');

INSERT INTO branches (id, restaurant_id, name, address)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'ዋና ቅርንጫፍ', 'ቦሌ መንገድ');

INSERT INTO tables (id, branch_id, table_number, capacity) VALUES
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 1, 4),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 2, 4),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 3, 6),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 4, 2);

INSERT INTO categories (id, restaurant_id, name, icon, display_order) VALUES
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'ቁርስ', '🍳', 1),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'ምሳ', '🍽️', 2),
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111', 'እራት', '🌙', 3),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'መጠጦች', '🥤', 4);

INSERT INTO menu_items (category_id, name, description, price, cost_price) VALUES
  ('44444444-4444-4444-4444-444444444441', 'ፍርፍር', 'በቅቤ የተዘጋጀ', 120, 40),
  ('44444444-4444-4444-4444-444444444441', 'ጥብስ', 'በቲማቲም የተዘጋጀ', 180, 60),
  ('44444444-4444-4444-4444-444444444442', 'ዶሮ ወጥ', 'የቤት ዶሮ', 280, 120),
  ('44444444-4444-4444-4444-444444444442', 'ብርሃን ምሳ', 'የተለያዩ ምግቦች', 350, 150),
  ('44444444-4444-4444-4444-444444444443', 'አሳ ጥብስ', 'ትኩስ አሳ', 320, 140),
  ('44444444-4444-4444-4444-444444444444', 'ቢራ', 'የቀዘቀዘ', 80, 35),
  ('44444444-4444-4444-4444-444444444444', 'ሶዳ', 'ቀዝቃዛ', 50, 20);
