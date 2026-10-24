/**
 * Test Suite: Admin Forgot Email & Password Recovery Workflow
 */

const BASE_URL = 'http://127.0.0.1:3001/api';

async function runRecoveryTests() {
  console.log('--- STARTING ADMIN CREDENTIAL RECOVERY TEST SUITE ---');

  // Test 1: Forgot password with non-existent account
  console.log('\n[Test 1] Request reset code for non-existent account...');
  const fakeRes = await fetch(`${BASE_URL}/admin/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'nonexistent_user@example.com' })
  });
  const fakeData = await fakeRes.json();
  console.log(`Status: ${fakeRes.status} (Expected 404)`);
  if (fakeRes.status !== 404) throw new Error('Expected 404 for unknown user');
  console.log('✓ Correctly rejected non-existent account request.');

  // Test 2: Forgot password with valid username 'admin'
  console.log('\n[Test 2] Request reset code for valid account "admin"...');
  const codeRes = await fetch(`${BASE_URL}/admin/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin' })
  });
  const codeData = await codeRes.json();
  console.log('Response:', codeData);
  if (!codeData.success || !codeData.demoCode) {
    throw new Error('Failed to generate reset code');
  }
  const generatedCode = codeData.demoCode;
  console.log(`✓ Code generated: ${generatedCode}, Masked Email: ${codeData.maskedEmail}`);

  // Test 3: Attempt reset with incorrect verification code
  console.log('\n[Test 3] Attempt reset with invalid 6-digit code...');
  const badCodeRes = await fetch(`${BASE_URL}/admin/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'admin',
      resetCode: '999999',
      newPassword: 'BrandNewPassword2026!'
    })
  });
  console.log(`Status: ${badCodeRes.status} (Expected 400)`);
  if (badCodeRes.status !== 400) throw new Error('Expected 400 for bad reset code');
  console.log('✓ Rejected invalid reset code properly.');

  // Test 4: Reset password with valid verification code
  console.log('\n[Test 4] Reset password with valid code...');
  const resetRes = await fetch(`${BASE_URL}/admin/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'admin',
      resetCode: generatedCode,
      newPassword: 'BrandNewPassword2026!'
    })
  });
  const resetData = await resetRes.json();
  console.log('Reset response:', resetData);
  if (!resetData.success) throw new Error('Password reset failed');
  console.log('✓ Password reset succeeded with valid code.');

  // Test 5: Try reusing the same reset code (must fail)
  console.log('\n[Test 5] Verify code reuse prevention...');
  const reuseRes = await fetch(`${BASE_URL}/admin/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'admin',
      resetCode: generatedCode,
      newPassword: 'AnotherPassword2026!'
    })
  });
  if (reuseRes.status !== 400) throw new Error('Code reuse was not prevented');
  console.log('✓ Reset code properly marked as used and single-use enforced.');

  // Test 6: Verify login with new password
  console.log('\n[Test 6] Login with new password...');
  const newLoginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'BrandNewPassword2026!' })
  });
  const newLoginData = await newLoginRes.json();
  if (!newLoginData.token) throw new Error('Failed to login with newly reset password');
  console.log('✓ Successfully authenticated with newly reset password!');

  // Test 7: Verify old password fails
  console.log('\n[Test 7] Verify old password no longer works...');
  const oldLoginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Resplandor2026!' })
  });
  if (oldLoginRes.status !== 401) throw new Error('Old password was not invalidated');
  console.log('✓ Old password properly invalidated.');

  // Test 8: Forgot Email / Username recovery using Master Recovery Key
  console.log('\n[Test 8] Recover account identity using Master Recovery Key...');
  // Bad key
  const badKeyRes = await fetch(`${BASE_URL}/admin/recover-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recoveryKey: 'WRONG-KEY-123' })
  });
  if (badKeyRes.status !== 401) throw new Error('Expected 401 for wrong master recovery key');
  console.log('✓ Bad recovery key rejected.');

  // Valid key
  const goodKeyRes = await fetch(`${BASE_URL}/admin/recover-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recoveryKey: 'RESPLANDOR-ATL-OWNER-KEY-2026' })
  });
  const goodKeyData = await goodKeyRes.json();
  console.log('Recovered identity:', goodKeyData);
  if (!goodKeyData.success || !goodKeyData.admin || !goodKeyData.admin.email) {
    throw new Error('Failed to recover account identity with Master Key');
  }
  console.log(`✓ Disclosed registered username: "${goodKeyData.admin.username}" and email: "${goodKeyData.admin.email}".`);

  // Test 9: Reset password directly with Master Recovery Key (Emergency Mode)
  console.log('\n[Test 9] Reset password back to default using Master Recovery Key...');
  const masterResetRes = await fetch(`${BASE_URL}/admin/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recoveryKey: 'RESPLANDOR-ATL-OWNER-KEY-2026',
      newPassword: 'Resplandor2026!'
    })
  });
  const masterResetData = await masterResetRes.json();
  if (!masterResetData.success) throw new Error('Failed to reset password via Master Recovery Key');
  console.log('✓ Successfully reset password using Master Recovery Key!');

  // Test 10: Verify login works with default password again
  console.log('\n[Test 10] Verify login with restored default credentials...');
  const finalLoginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Resplandor2026!' })
  });
  const finalLoginData = await finalLoginRes.json();
  if (!finalLoginData.token) throw new Error('Login failed with restored default password');
  console.log('✓ Restored default credentials login verified!');

  console.log('\n======================================================');
  console.log('ALL 10 ADMIN RECOVERY TESTS PASSED SUCCESSFULLY! (100%)');
  console.log('======================================================\n');
}

runRecoveryTests().catch((err) => {
  console.error('\n❌ RECOVERY TEST FAILED:', err);
  process.exit(1);
});
