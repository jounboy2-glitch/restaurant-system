-- ============================================
-- FUNCTIONS & TRIGGERS — ፋይናንስ ማስያዎች
-- ============================================

-- 1. Order total ራስ-ሰር ማስያ
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET total_price = (
    SELECT COALESCE(SUM(price * quantity), 0)
    FROM order_items
    WHERE order_id = NEW.order_id
  )
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_item_change ON order_items;
CREATE TRIGGER on_order_item_change
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION calculate_order_total();

-- 2. Activity log — Order ሲቀየር ይመዝገብ
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO activity_logs (
      action_type, entity, entity_id, old_value, new_value, description
    ) VALUES (
      'order_status',
      'order',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      'ትዕዛዝ ሁኔታ ተቀይሯል: ' || OLD.status || ' → ' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- 3. Shift totals ማስያ (Payment ሲጨመር)
CREATE OR REPLACE FUNCTION update_shift_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.shift_id IS NOT NULL THEN
    UPDATE shifts
    SET
      total_cash = COALESCE((SELECT SUM(amount) FROM payments WHERE shift_id = NEW.shift_id AND method = 'cash'), 0),
      total_telebirr = COALESCE((SELECT SUM(amount) FROM payments WHERE shift_id = NEW.shift_id AND method = 'telebirr'), 0),
      total_chapa = COALESCE((SELECT SUM(amount) FROM payments WHERE shift_id = NEW.shift_id AND method = 'chapa'), 0),
      total_card = COALESCE((SELECT SUM(amount) FROM payments WHERE shift_id = NEW.shift_id AND method = 'card'), 0),
      expected_total = COALESCE((SELECT SUM(amount) FROM payments WHERE shift_id = NEW.shift_id), 0)
    WHERE id = NEW.shift_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_payment_insert ON payments;
CREATE TRIGGER on_payment_insert
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_shift_totals();

-- 4. Daily report ማስያ function
CREATE OR REPLACE FUNCTION get_daily_report(p_date DATE, p_branch_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_expenses NUMERIC,
  total_payments_count INT,
  total_orders INT,
  avg_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(amount) FROM payments
      WHERE DATE(created_at) = p_date
      AND (p_branch_id IS NULL OR TRUE)), 0),
    COALESCE((SELECT SUM(amount) FROM expenses
      WHERE DATE(created_at) = p_date
      AND (p_branch_id IS NULL OR branch_id = p_branch_id)), 0),
    COALESCE((SELECT COUNT(*) FROM payments
      WHERE DATE(created_at) = p_date), 0)::INT,
    COALESCE((SELECT COUNT(*) FROM orders
      WHERE DATE(created_at) = p_date), 0)::INT,
    COALESCE((SELECT AVG(total_price) FROM orders
      WHERE DATE(created_at) = p_date), 0);
END;
$$ LANGUAGE plpgsql;

-- 5. የሽፍት ማጠቃለያ function
CREATE OR REPLACE FUNCTION close_shift(p_shift_id UUID, p_actual_total NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE shifts
  SET
    status = 'closed',
    end_time = NOW(),
    actual_total = p_actual_total,
    difference = p_actual_total - expected_total
  WHERE id = p_shift_id;
END;
$$ LANGUAGE plpgsql;
