-- Stripe 결제 시스템을 위한 데이터베이스 스키마

-- 구독 플랜 테이블
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  price INTEGER NOT NULL, -- 원 단위 (9900 = 9,900원)
  currency TEXT DEFAULT 'krw',
  interval TEXT DEFAULT 'month', -- 'month' or 'year'
  features JSONB NOT NULL, -- 제공 기능들
  max_recipes INTEGER DEFAULT 10,
  max_image_size INTEGER DEFAULT 5242880, -- 5MB
  has_ads BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 구독 테이블
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 결제 내역 테이블
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'krw',
  status TEXT CHECK (status IN ('succeeded', 'pending', 'failed', 'canceled')),
  payment_method TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 사용량 추적 테이블
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- '2024-01' 형식
  recipes_uploaded INTEGER DEFAULT 0,
  images_uploaded INTEGER DEFAULT 0,
  total_image_size BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at 
  BEFORE UPDATE ON user_usage 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책 설정
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- 구독 플랜은 모든 사용자가 읽기 가능
CREATE POLICY "subscription_plans_read_policy" ON subscription_plans
  FOR SELECT USING (true);

-- 사용자 구독은 본인만 읽기 가능
CREATE POLICY "user_subscriptions_read_policy" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 결제 내역은 본인만 읽기 가능
CREATE POLICY "payments_read_policy" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- 사용량은 본인만 읽기/쓰기 가능
CREATE POLICY "user_usage_read_policy" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_usage_write_policy" ON user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_usage_update_policy" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- 기본 구독 플랜 데이터 삽입
INSERT INTO subscription_plans (name, stripe_price_id, price, features, max_recipes, has_ads) VALUES
('Basic', 'price_basic_monthly', 0, '["basic_upload", "basic_search", "ads"]', 10, true),
('Premium', 'price_premium_monthly', 9900, '["unlimited_upload", "hd_images", "no_ads", "advanced_search", "unlimited_favorites"]', -1, false),
('Pro', 'price_pro_monthly', 19900, '["premium_features", "nutrition_calc", "shopping_list", "recipe_analytics", "priority_support"]', -1, false);

-- 헬퍼 함수들
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  plan_name TEXT,
  plan_price INTEGER,
  status TEXT,
  current_period_end TIMESTAMP,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name,
    sp.price,
    us.status,
    us.current_period_end,
    sp.features
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_usage(user_uuid UUID, month_year TEXT)
RETURNS TABLE (
  recipes_uploaded INTEGER,
  images_uploaded INTEGER,
  total_image_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uu.recipes_uploaded,
    uu.images_uploaded,
    uu.total_image_size
  FROM user_usage uu
  WHERE uu.user_id = user_uuid 
    AND uu.month_year = month_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 