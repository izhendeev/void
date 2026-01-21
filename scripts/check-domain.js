/**
 * Утилита для проверки домена в accountAssociation payload
 * Использование: node scripts/check-domain.js
 */

const payload = "eyJkb21haW4iOiJ2b2lkLXJ1ZGR5LnZlcmNlbC5hcHAifQ";

try {
  const decoded = Buffer.from(payload, 'base64').toString('utf-8');
  const parsed = JSON.parse(decoded);
  console.log('📋 Текущий домен в payload:', parsed.domain);
  console.log('🔗 Полный URL:', `https://${parsed.domain}`);
} catch (error) {
  console.error('❌ Ошибка при декодировании:', error.message);
}
