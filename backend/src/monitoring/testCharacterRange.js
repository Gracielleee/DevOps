// Run with: node testCharacterRange.js

import assert from 'node:assert';
import { getCharacterRange, CONTENT_TYPES } from './monitoringConstants.js'; 


function runTests() {
  console.log('🧪 Starting validation tests for getCharacterRange...\n');

  try {
    // --- TEST CASE 1: Validation Edge Cases ---
    console.log('⏳ Running validation checks...');
    assert.strictEqual(getCharacterRange(null, CONTENT_TYPES.MESSAGE), null, 'Should return null for null input');
    assert.strictEqual(getCharacterRange(undefined, CONTENT_TYPES.MESSAGE), null, 'Should return null for undefined input');
    assert.strictEqual(getCharacterRange(12345, CONTENT_TYPES.MESSAGE), null, 'Should return null for numbers');
    assert.strictEqual(getCharacterRange('', CONTENT_TYPES.MESSAGE), null, 'Should return null for completely empty string if minimum range is 1');
    console.log('   ✅ Validation checks passed.');

    // --- TEST CASE 2: Message Boundaries (0-5000 scale) ---
    console.log('\n⏳ Running MESSAGE ranges testing...');
    
    assert.strictEqual(getCharacterRange('a', CONTENT_TYPES.MESSAGE), '1-19'); 
    assert.strictEqual(getCharacterRange('a'.repeat(19), CONTENT_TYPES.MESSAGE), '1-19');
    
    assert.strictEqual(getCharacterRange('a'.repeat(20), CONTENT_TYPES.MESSAGE), '20-49');
    assert.strictEqual(getCharacterRange('a'.repeat(49), CONTENT_TYPES.MESSAGE), '20-49');
    
    assert.strictEqual(getCharacterRange('a'.repeat(50), CONTENT_TYPES.MESSAGE), '50-199');
    assert.strictEqual(getCharacterRange('a'.repeat(199), CONTENT_TYPES.MESSAGE), '50-199');
    
    assert.strictEqual(getCharacterRange('a'.repeat(200), CONTENT_TYPES.MESSAGE), '200-799');
    assert.strictEqual(getCharacterRange('a'.repeat(799), CONTENT_TYPES.MESSAGE), '200-799');
    
    assert.strictEqual(getCharacterRange('a'.repeat(800), CONTENT_TYPES.MESSAGE), '800-1799');
    assert.strictEqual(getCharacterRange('a'.repeat(1799), CONTENT_TYPES.MESSAGE), '800-1799');
    
    assert.strictEqual(getCharacterRange('a'.repeat(1800), CONTENT_TYPES.MESSAGE), '1800-3199');
    assert.strictEqual(getCharacterRange('a'.repeat(3199), CONTENT_TYPES.MESSAGE), '1800-3199');
    
    assert.strictEqual(getCharacterRange('a'.repeat(3200), CONTENT_TYPES.MESSAGE), '3200-5000');
    assert.strictEqual(getCharacterRange('a'.repeat(5000), CONTENT_TYPES.MESSAGE), '3200-5000');
    console.log('   ✅ MESSAGE ranges passed.');

    // --- TEST CASE 3: Material Boundaries (0-20000 scale) ---
    console.log('\n⏳ Running MATERIAL ranges testing...');
    
    assert.strictEqual(getCharacterRange('a', CONTENT_TYPES.MATERIAL), '1-19');
    assert.strictEqual(getCharacterRange('a'.repeat(19), CONTENT_TYPES.MATERIAL), '1-19');
    
    assert.strictEqual(getCharacterRange('a'.repeat(20), CONTENT_TYPES.MATERIAL), '20-49');
    assert.strictEqual(getCharacterRange('a'.repeat(49), CONTENT_TYPES.MATERIAL), '20-49');
    
    assert.strictEqual(getCharacterRange('a'.repeat(50), CONTENT_TYPES.MATERIAL), '50-799');
    assert.strictEqual(getCharacterRange('a'.repeat(799), CONTENT_TYPES.MATERIAL), '50-799');
    
    assert.strictEqual(getCharacterRange('a'.repeat(800), CONTENT_TYPES.MATERIAL), '800-3199');
    assert.strictEqual(getCharacterRange('a'.repeat(3199), CONTENT_TYPES.MATERIAL), '800-3199');
    
    assert.strictEqual(getCharacterRange('a'.repeat(3200), CONTENT_TYPES.MATERIAL), '3200-7199');
    assert.strictEqual(getCharacterRange('a'.repeat(7199), CONTENT_TYPES.MATERIAL), '3200-7199');
    
    assert.strictEqual(getCharacterRange('a'.repeat(7200), CONTENT_TYPES.MATERIAL), '7200-12799');
    assert.strictEqual(getCharacterRange('a'.repeat(12799), CONTENT_TYPES.MATERIAL), '7200-12799');
    
    assert.strictEqual(getCharacterRange('a'.repeat(12800), CONTENT_TYPES.MATERIAL), '12800-20000');
    assert.strictEqual(getCharacterRange('a'.repeat(20000), CONTENT_TYPES.MATERIAL), '12800-20000');
    console.log('   ✅ MATERIAL ranges passed.');

    // --- TEST CASE 4: String Trimming Behavior ---
    console.log('\n⏳ Checking whitespace trimming behavior...');
    const paddedString = '   hello   '; // 5 characters of actual text length
    assert.strictEqual(getCharacterRange(paddedString, CONTENT_TYPES.MESSAGE), '1-19', 'Should compute trimmed length instead of raw length');
    console.log('   ✅ Trimming verification passed.');

    // --- TEST CASE 5: Out of Bounds Threshold ---
    console.log('\n⏳ Testing payload sizing overflow...');
    const giantMessage = 'a'.repeat(5001);
    const giantMaterial = 'a'.repeat(20001);
    assert.strictEqual(getCharacterRange(giantMessage, CONTENT_TYPES.MESSAGE), null, 'Should return null if message overflows 5000 max');
    assert.strictEqual(getCharacterRange(giantMaterial, CONTENT_TYPES.MATERIAL), null, 'Should return null if material overflows 20000 max');
    console.log('   ✅ Overflow handling passed.');

    console.log('\n🎉 SUCCESS: All tests passed.');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

runTests();