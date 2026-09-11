-- RESTAURANT SYSTEM — production-safe RLS baseline
-- The original draft queried public.users from a users policy, which can recurse.
-- This helper is SECURITY DEFINER so role checks do not re-enter the users policies.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('users','restaurants','branches','tables','categories','menu_items',
                        'orders','order_items','payments','expenses','activity_logs','notifications')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY users_select_own ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY users_select_management ON public.users
  FOR SELECT TO authenticated USING (public.current_user_role() IN ('owner','admin','manager'));
CREATE POLICY users_update_own ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
CREATE POLICY users_update_management ON public.users
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager'))
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager'));
CREATE POLICY users_insert_owner ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'owner');

-- Restaurant / branch / table / menu
CREATE POLICY restaurants_select ON public.restaurants FOR SELECT USING (true);
CREATE POLICY restaurants_update_owner ON public.restaurants FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY branches_select ON public.branches FOR SELECT USING (true);
CREATE POLICY branches_modify_management ON public.branches FOR ALL TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager'))
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager'));

CREATE POLICY tables_select ON public.tables FOR SELECT USING (true);
CREATE POLICY tables_modify_management ON public.tables FOR ALL TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager'))
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager'));

CREATE POLICY categories_select ON public.categories FOR SELECT USING (true);
CREATE POLICY categories_modify_management ON public.categories FOR ALL TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager'))
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager'));

CREATE POLICY menu_select ON public.menu_items FOR SELECT USING (true);
CREATE POLICY menu_modify_management ON public.menu_items FOR ALL TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager'))
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager'));

-- Orders: customer QR ordering is intentionally public; staff can manage status.
CREATE POLICY orders_select ON public.orders FOR SELECT USING (true);
CREATE POLICY orders_insert_customer ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY orders_update_staff ON public.orders FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager','waiter','kitchen'))
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager','waiter','kitchen'));

CREATE POLICY order_items_select ON public.order_items FOR SELECT USING (true);
CREATE POLICY order_items_insert_customer ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY order_items_update_staff ON public.order_items FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager','waiter','kitchen'))
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager','waiter','kitchen'));

-- Payments / shifts
CREATE POLICY payments_select_staff ON public.payments FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager','waiter'));
CREATE POLICY payments_insert_staff ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager','waiter'));

CREATE POLICY shifts_select_staff ON public.shifts FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager','waiter'));
CREATE POLICY shifts_insert_waiter ON public.shifts FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager','waiter'));
CREATE POLICY shifts_update_waiter ON public.shifts FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager','waiter'))
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager','waiter'));

-- Expenses / logs / notifications
CREATE POLICY expenses_select_management ON public.expenses FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager'));
CREATE POLICY expenses_insert_management ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager'));
CREATE POLICY expenses_update_management ON public.expenses FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager'))
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager'));
CREATE POLICY expenses_delete_management ON public.expenses FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('owner','admin','manager'));

CREATE POLICY activity_select_management ON public.activity_logs FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('owner','admin'));
CREATE POLICY activity_insert_management ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('owner','admin','manager'));

CREATE POLICY notifications_select_staff ON public.notifications FOR SELECT TO authenticated
  USING (target_role IS NULL OR target_role = public.current_user_role() OR target_user_id = auth.uid());
CREATE POLICY notifications_insert ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY notifications_update_staff ON public.notifications FOR UPDATE TO authenticated
  USING (target_user_id = auth.uid() OR public.current_user_role() IN ('owner','admin','manager'))
  WITH CHECK (target_user_id = auth.uid() OR public.current_user_role() IN ('owner','admin','manager'));
