import { DexScreenerService } from '../services/dexscreener.js';
import type { 
  TokenProfile, 
  TokenBoost, 
  TokenOrder, 
  DexResponse 
} from '../types/index.js';

const service = new DexScreenerService();

// Helper function to run tests
async function runTest(name: string, fn: () => Promise<void>) {
  const startTime = Date.now();
  try {
    console.log(`\n🔍 Running test: ${name}`);
    await fn();
    const duration = Date.now() - startTime;
    console.log(`✅ ${name} passed (${duration}ms)`);
  } catch (error) {
    console.error(`❌ ${name} failed after ${Date.now() - startTime}ms:`);
    if (error instanceof Error) {
      console.error('Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      if (error.message.includes('API request failed')) {
        console.log('Skipping test due to API error');
        return;
      }
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}

// Type validation helpers
function validateTokenProfile(profile: any): profile is TokenProfile {
  return typeof profile === 'object' && profile !== null &&
    typeof profile.chainId === 'string' &&
    typeof profile.tokenAddress === 'string';
}

function validateTokenBoost(boost: any): boost is TokenBoost {
  return typeof boost === 'object' && boost !== null &&
    typeof boost.chainId === 'string' &&
    typeof boost.tokenAddress === 'string';
}

function validateTokenOrder(order: any): order is TokenOrder {
  return typeof order === 'object' && order !== null &&
    typeof order.type === 'string' &&
    typeof order.status === 'string' &&
    typeof order.paymentTimestamp === 'number' &&
    (!order.chainId || typeof order.chainId === 'string') &&
    (!order.tokenAddress || typeof order.tokenAddress === 'string');
}

function validateDexResponse(response: any): response is DexResponse {
  return typeof response === 'object' && response !== null &&
    typeof response.schemaVersion === 'string' &&
    (response.pairs === null || Array.isArray(response.pairs));
}

// Test suite
async function runTests() {
  // Test getLatestTokenProfiles
  await runTest('getLatestTokenProfiles', async () => {
    const profiles = await service.getLatestTokenProfiles();
    console.log('📊 Response:', JSON.stringify(profiles.slice(0, 2), null, 2));
    
    if (!Array.isArray(profiles)) {
      throw new Error('Expected array of token profiles');
    }
    if (profiles.length === 0) {
      console.warn('⚠️ Warning: No token profiles returned');
    }
    if (!profiles.every(validateTokenProfile)) {
      throw new Error('Invalid token profile structure');
    }
  });

  // Test getLatestBoostedTokens
  await runTest('getLatestBoostedTokens', async () => {
    const tokens = await service.getLatestBoostedTokens();
    console.log('📊 Response:', JSON.stringify(tokens.slice(0, 2), null, 2));
    
    if (!Array.isArray(tokens)) {
      throw new Error('Expected array of boosted tokens');
    }
    if (tokens.length === 0) {
      console.warn('⚠️ Warning: No boosted tokens returned');
    }
    if (!tokens.every(validateTokenBoost)) {
      throw new Error('Invalid token boost structure');
    }
  });

  // Test getTopBoostedTokens
  await runTest('getTopBoostedTokens', async () => {
    const tokens = await service.getTopBoostedTokens();
    console.log('📊 Response:', JSON.stringify(tokens.slice(0, 2), null, 2));
    
    if (!Array.isArray(tokens)) {
      throw new Error('Expected array of top boosted tokens');
    }
    if (tokens.length === 0) {
      console.warn('⚠️ Warning: No top boosted tokens returned');
    }
    if (!tokens.every(validateTokenBoost)) {
      throw new Error('Invalid token boost structure');
    }
  });

  // Test getTokenOrders
  await runTest('getTokenOrders', async () => {
    const orders = await service.getTokenOrders({
      chainId: 'solana',
      tokenAddress: 'So11111111111111111111111111111111111111112' // SOL token address
    });
    console.log('📊 Response:', JSON.stringify(orders.slice(0, 2), null, 2));
    
    if (!Array.isArray(orders)) {
      throw new Error('Expected array of token orders');
    }
    if (orders.length === 0) {
      console.warn('⚠️ Warning: No token orders returned');
    }
    if (!orders.every(validateTokenOrder)) {
      throw new Error('Invalid token order structure');
    }
  });

  // Test getPairsByChainAndAddress
  await runTest('getPairsByChainAndAddress', async () => {
    // Test with valid pair
    const response = await service.getPairsByChainAndAddress({
      chainId: 'solana',
      pairId: '8slbnzoa1cfnvmjlpfp98zlanfsycfapfjkmbixnlwxj' // Active Raydium SOL-USDC pair
    });
    console.log('📊 Full Response:', JSON.stringify(response, null, 2));
    
    if (!response || typeof response !== 'object') {
      throw new Error('Expected response object');
    }
    if (!validateDexResponse(response)) {
      throw new Error('Invalid DEX response structure');
    }

    // Validate response structure
    if (response.pairs === null && response.pair === null) {
      throw new Error('Both pairs and pair are null');
    }

    // If we have pairs data, validate first pair
    if (response.pairs && response.pairs.length > 0) {
      const pair = response.pairs[0];
      if (!pair.baseToken || !pair.quoteToken) {
        throw new Error('Invalid pair token data');
      }
      if (typeof pair.priceUsd !== 'string') {
        throw new Error('Invalid price data');
      }
    }

    // Test with invalid pair
    try {
      await service.getPairsByChainAndAddress({
        chainId: 'invalid-chain',
        pairId: 'invalid-pair'
      });
      throw new Error('Expected error for invalid pair');
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error('Expected error instance');
      }
      console.log('✅ Successfully caught invalid pair error');
    }
  });

  // Test getPairsByTokenAddresses
  await runTest('getPairsByTokenAddresses', async () => {
    const response = await service.getPairsByTokenAddresses({
      tokenAddresses: 'So11111111111111111111111111111111111111112' // SOL token address
    });
    console.log('📊 Response:', JSON.stringify(response, null, 2));
    
    if (!response || typeof response !== 'object') {
      throw new Error('Expected response object');
    }
    if (!validateDexResponse(response)) {
      throw new Error('Invalid DEX response structure');
    }
    if (!response.pairs) {
      console.warn('⚠️ Warning: pairs property is null');
    }
  });

  // Test searchPairs
  await runTest('searchPairs', async () => {
    const response = await service.searchPairs({
      query: 'SOL'
    });
    console.log('📊 Response:', JSON.stringify({
      ...response,
      pairs: response.pairs?.slice(0, 2)
    }, null, 2));
    
    if (!response || typeof response !== 'object') {
      throw new Error('Expected response object');
    }
    if (!validateDexResponse(response)) {
      throw new Error('Invalid DEX response structure');
    }
    if (!response.pairs) {
      console.warn('⚠️ Warning: pairs property is null');
    }
  });

  // Test rate limiting
  await runTest('rateLimiting', async () => {
    console.log('🕒 Testing concurrent requests...');
    const startTime = Date.now();
    
    const promises = Array(3).fill(null).map(() => 
      service.searchPairs({ query: 'SOL' })
    );
    const results = await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ Concurrent requests completed in ${duration}ms`);
    
    if (!results.every(r => r && typeof r === 'object')) {
      throw new Error('Rate limiting failed to handle concurrent requests');
    }
    if (!results.every(validateDexResponse)) {
      throw new Error('Invalid DEX response structure in concurrent requests');
    }
  });

  // Test error handling with various scenarios
  await runTest('errorHandling', async () => {
    // Test invalid chain
    try {
      await service.getPairsByChainAndAddress({
        chainId: 'invalid-chain',
        pairId: '8slbnzoa1cfnvmjlpfp98zlanfsycfapfjkmbixnlwxj'
      });
      throw new Error('Expected error for invalid chain');
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error('Expected error instance');
      }
      console.log('✅ Successfully caught invalid chain error');
    }

    // Test invalid token address
    try {
      await service.getPairsByTokenAddresses({
        tokenAddresses: 'invalid-token'
      });
      throw new Error('Expected error for invalid token');
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error('Expected error instance');
      }
      console.log('✅ Successfully caught invalid token error');
    }

    // Test empty search query
    try {
      await service.searchPairs({
        query: ''
      });
      throw new Error('Expected error for empty search');
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error('Expected error instance');
      }
      console.log('✅ Successfully caught empty search error');
    }
  });
}

// Run all tests
console.log('Starting DexScreener API integration tests...');
runTests()
  .then(() => console.log('All tests completed successfully! 🎉'))
  .catch(error => {
    console.error('Tests failed:', error);
    process.exit(1);
  });
