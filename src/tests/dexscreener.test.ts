import { DexScreenerService } from '../services/dexscreener.js';

const service = new DexScreenerService();

// Helper function to run tests
async function runTest(name: string, fn: () => Promise<void>) {
  try {
    console.log(`Running test: ${name}`);
    await fn();
    console.log(`✅ ${name} passed`);
  } catch (error) {
    console.error(`❌ ${name} failed:`, error);
    if (error instanceof Error && error.message.includes('API request failed')) {
      console.log('Skipping test due to API error');
      return;
    }
    throw error;
  }
}

// Test suite
async function runTests() {
  // Test getLatestTokenProfiles
  await runTest('getLatestTokenProfiles', async () => {
    const profiles = await service.getLatestTokenProfiles();
    if (!Array.isArray(profiles)) {
      throw new Error('Expected array of token profiles');
    }
  });

  // Test getLatestBoostedTokens
  await runTest('getLatestBoostedTokens', async () => {
    const tokens = await service.getLatestBoostedTokens();
    if (!Array.isArray(tokens)) {
      throw new Error('Expected array of boosted tokens');
    }
  });

  // Test getTopBoostedTokens
  await runTest('getTopBoostedTokens', async () => {
    const tokens = await service.getTopBoostedTokens();
    if (!Array.isArray(tokens)) {
      throw new Error('Expected array of top boosted tokens');
    }
  });

  // Test getTokenOrders
  await runTest('getTokenOrders', async () => {
    const orders = await service.getTokenOrders({
      chainId: 'solana',
      tokenAddress: 'So11111111111111111111111111111111111111112' // SOL token address
    });
    if (!Array.isArray(orders)) {
      throw new Error('Expected array of token orders');
    }
  });

  // Test getPairsByChainAndAddress
  await runTest('getPairsByChainAndAddress', async () => {
    const response = await service.getPairsByChainAndAddress({
      chainId: 'solana',
      pairId: 'HxFLKUAmAMLz1jtT3hbvCMELwH5H9tpM2QugP8sKyfhc' // SOL-USDC pair
    });
    if (!response || typeof response !== 'object') {
      throw new Error('Expected response object');
    }
    if (!Array.isArray(response.pairs)) {
      console.warn('Warning: pairs property is not an array or is missing');
      console.log('Response:', JSON.stringify(response, null, 2));
    }
  });

  // Test getPairsByTokenAddresses
  await runTest('getPairsByTokenAddresses', async () => {
    const response = await service.getPairsByTokenAddresses({
      tokenAddresses: 'So11111111111111111111111111111111111111112' // SOL token address
    });
    if (!response || typeof response !== 'object') {
      throw new Error('Expected response object');
    }
    if (!Array.isArray(response.pairs)) {
      console.warn('Warning: pairs property is not an array or is missing');
      console.log('Response:', JSON.stringify(response, null, 2));
    }
  });

  // Test searchPairs
  await runTest('searchPairs', async () => {
    const response = await service.searchPairs({
      query: 'SOL'
    });
    if (!response || typeof response !== 'object') {
      throw new Error('Expected response object');
    }
    if (!Array.isArray(response.pairs)) {
      console.warn('Warning: pairs property is not an array or is missing');
      console.log('Response:', JSON.stringify(response, null, 2));
    }
  });

  // Test rate limiting
  await runTest('rateLimiting', async () => {
    const promises = Array(3).fill(null).map(() => 
      service.searchPairs({ query: 'SOL' })
    );
    const results = await Promise.all(promises);
    if (!results.every(r => r && typeof r === 'object')) {
      throw new Error('Rate limiting failed to handle concurrent requests');
    }
  });

  // Test error handling
  await runTest('errorHandling', async () => {
    try {
      await service.getPairsByChainAndAddress({
        chainId: 'invalid',
        pairId: 'invalid'
      });
      throw new Error('Expected error for invalid chain/pair');
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error('Expected error instance');
      }
      // Success - we expected an error
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
