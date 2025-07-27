# Stripe 설정 가이드

## 1. Stripe 계정 설정

### 1.1 Stripe 계정 생성
1. [Stripe Dashboard](https://dashboard.stripe.com)에 가입
2. 계정 정보 입력 및 이메일 인증
3. 비즈니스 정보 설정

### 1.2 API 키 확인
1. Dashboard → Developers → API keys
2. 다음 키들을 복사:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

## 2. 환경 변수 설정

### 2.1 .env.local 파일에 추가
```bash
# Stripe 설정
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# 사이트 URL
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## 3. Stripe Products & Prices 설정

### 3.1 Products 생성
1. Dashboard → Products → Add product
2. 다음 제품들을 생성:

#### Basic Plan (무료)
- **Name**: Basic Plan
- **Description**: 기본 기능 포함
- **Price**: $0/month

#### Premium Plan
- **Name**: Premium Plan  
- **Description**: 무제한 업로드, 광고 제거
- **Price**: ₩9,900/month

#### Pro Plan
- **Name**: Pro Plan
- **Description**: 모든 프리미엄 기능
- **Price**: ₩19,900/month

### 3.2 Price IDs 확인
각 제품의 Price ID를 복사하여 `stripe-schema.sql`의 `stripe_price_id` 값으로 사용:

```sql
-- 실제 Price ID로 업데이트
INSERT INTO subscription_plans (name, stripe_price_id, price, features, max_recipes, has_ads) VALUES
('Basic', 'price_actual_basic_id', 0, '["basic_upload", "basic_search", "ads"]', 10, true),
('Premium', 'price_actual_premium_id', 9900, '["unlimited_upload", "hd_images", "no_ads", "advanced_search", "unlimited_favorites"]', -1, false),
('Pro', 'price_actual_pro_id', 19900, '["premium_features", "nutrition_calc", "shopping_list", "recipe_analytics", "priority_support"]', -1, false);
```

## 4. Webhook 설정

### 4.1 Webhook Endpoint 생성
1. Dashboard → Developers → Webhooks
2. **Add endpoint** 클릭
3. **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 4.2 Webhook Secret 복사
1. 생성된 webhook의 **Signing secret** 복사
2. `.env.local`의 `STRIPE_WEBHOOK_SECRET`에 설정

## 5. 데이터베이스 설정

### 5.1 Supabase에서 스키마 실행
1. Supabase Dashboard → SQL Editor
2. `stripe-schema.sql` 파일의 내용을 실행
3. 실제 Price ID로 업데이트

### 5.2 테이블 확인
다음 테이블들이 생성되었는지 확인:
- `subscription_plans`
- `user_subscriptions`
- `payments`
- `user_usage`

## 6. 패키지 설치

### 6.1 필요한 패키지 설치
```bash
npm install stripe @stripe/stripe-js
```

### 6.2 타입 정의 설치
```bash
npm install --save-dev @types/stripe
```

## 7. 테스트 설정

### 7.1 테스트 카드 번호
Stripe 테스트 모드에서 사용할 수 있는 카드 번호:
- **성공**: `4242 4242 4242 4242`
- **실패**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### 7.2 테스트 고객 생성
1. Dashboard → Customers → Add customer
2. 테스트 이메일과 이름 입력
3. 테스트 결제 정보 추가

## 8. 프로덕션 설정

### 8.1 라이브 모드 전환
1. Dashboard에서 **Live mode** 토글
2. 새로운 API 키 생성
3. 환경 변수 업데이트

### 8.2 도메인 설정
1. Webhook URL을 실제 도메인으로 업데이트
2. `NEXT_PUBLIC_SITE_URL`을 실제 도메인으로 설정

## 9. 모니터링

### 9.1 Dashboard 모니터링
- Dashboard → Payments: 결제 내역 확인
- Dashboard → Subscriptions: 구독 상태 확인
- Dashboard → Customers: 고객 정보 확인

### 9.2 로그 확인
- Dashboard → Developers → Logs
- Webhook 이벤트 로그 확인
- API 호출 로그 확인

## 10. 문제 해결

### 10.1 일반적인 문제들
1. **Webhook 실패**: URL과 시크릿 확인
2. **결제 실패**: 카드 정보와 CVC 확인
3. **API 오류**: API 키와 권한 확인

### 10.2 디버깅
```bash
# 로그 확인
tail -f logs/stripe.log

# 환경 변수 확인
echo $STRIPE_SECRET_KEY
```

## 11. 보안 고려사항

### 11.1 API 키 보안
- Secret key는 절대 클라이언트에 노출하지 않음
- 환경 변수로 안전하게 관리
- 정기적으로 키 로테이션

### 11.2 Webhook 보안
- Webhook 시크릿으로 요청 검증
- HTTPS 사용 필수
- IP 화이트리스트 설정 (선택사항)

## 12. 성공적인 론칭 체크리스트

- [ ] Stripe 계정 설정 완료
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 스키마 실행 완료
- [ ] Webhook 설정 완료
- [ ] 테스트 결제 성공
- [ ] 구독 생성/취소 테스트
- [ ] 프로덕션 모드 전환
- [ ] 실제 도메인 설정
- [ ] 모니터링 설정
- [ ] 고객 지원 준비 