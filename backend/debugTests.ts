import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { debugDatabase } from './inventory';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.error(`Environment file not found at ${envPath}`);
  process.exit(1);
}

async function runTests() {
  console.log('Starting database debug tests...');
  
  try {
    // Run the debug function
    const results = await debugDatabase();
    
    // Log the summary
    console.log('\nTest Results Summary:');
    Object.entries(results).forEach(([key, value]) => {
      if (key !== 'errors') {
        const testResult = value as any;
        if (testResult?.success) {
          console.log(`✅ ${key}: Success${testResult.time ? ` (${testResult.time}ms)` : ''}`);
        } else {
          console.log(`❌ ${key}: Failed - ${testResult?.error || 'Unknown error'}`);
        }
      }
    });
    
    // Exit with appropriate code
    if (results.errors.length === 0) {
      console.log('\n🎉 All tests passed successfully!');
      process.exit(0);
    } else {
      console.error(`\n❌ ${results.errors.length} tests failed.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Critical error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 