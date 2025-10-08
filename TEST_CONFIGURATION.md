# Test Configuration Guide

This document explains all test configuration parameters in the `.env` file.

---

## Configuration Parameters

All test parameters are configured in the `.env` file under the `# Test Configuration` section.

### Gas Consumption Testing

#### `GAS_TEST_TRANSACTIONS`
**Default**: `2000`
**Purpose**: Total number of transactions to run per level for gas consumption testing

**How it works**:
- If set to `100`, the test will run 100 transactions for each selected level
- Example with `GAS_TEST_TRANSACTIONS=100` and `GAS_TEST_LEVELS=0,1,2,3`:
  - Level 0: 100 transactions
  - Level 1: 100 transactions
  - Level 2: 100 transactions
  - Level 3: 100 transactions
  - **Total: 400 transactions**

**Impact**:
- **Higher value** = More accurate gas average, but takes MUCH longer
- **Lower value** = Faster results, but fewer data points
- Original setting was 2000 → 8000 total transactions (12-20 hours)
- Current setting is 100 → 400 total transactions (20x faster, ~30-60 minutes)

**Recommended values**:
- Quick test: `50`
- Standard test: `100-200`
- Full research data: `1000-2000`

---

#### `GAS_TEST_LEVELS`
**Default**: `0,1,2,3`
**Purpose**: Which access control levels to test for gas consumption

**How it works**:
- Comma-separated list of levels (0, 1, 2, or 3)
- Only the specified levels will be tested

**Examples**:
```env
GAS_TEST_LEVELS=0,1,2,3    # Test all 4 levels (default)
GAS_TEST_LEVELS=2,3        # Only test Level 2 and Level 3
GAS_TEST_LEVELS=0          # Only test Level 0
GAS_TEST_LEVELS=3          # Only test Level 3 (most complex)
```

**Level descriptions**:
- **Level 0**: Manual access (simplest, lowest gas)
- **Level 1**: Time-based access (adds time validation)
- **Level 2**: Policy retrieval (adds blockchain read from PolicyContract)
- **Level 3**: Full chain validation (most complex, highest gas - reads from multiple contracts + writes log)

**Impact**:
- Fewer levels = Faster completion
- If you only care about the most complex scenario, use `GAS_TEST_LEVELS=3`

---

### Response Time Testing

#### `RESPONSE_TIME_MAX_TX`
**Default**: `20`
**Purpose**: Maximum number of transactions to test in response time tests

**How it works**:
- Tests will run from 1 transaction up to this maximum
- Creates a scalability curve showing how response time increases with transaction count

**Examples**:
```env
RESPONSE_TIME_MAX_TX=20    # Tests: 1, 2, 3, 4... up to 20 transactions (20 data points)
RESPONSE_TIME_MAX_TX=10    # Tests: 1, 2, 3, 4... up to 10 transactions (10 data points)
RESPONSE_TIME_MAX_TX=5     # Tests: 1, 2, 3, 4, 5 transactions (5 data points)
```

**Impact**:
- **Higher value** = More data points about scalability behavior
- **Lower value** = Faster testing
- Each transaction count is repeated `RESPONSE_TIME_REPETITIONS` times

**Recommended values**:
- Quick test: `5-10`
- Standard test: `20`
- Detailed analysis: `30-50`

---

#### `RESPONSE_TIME_REPETITIONS`
**Default**: `10`
**Purpose**: How many times to repeat each transaction count test for statistical accuracy

**How it works**:
- Each transaction count is tested multiple times to get reliable averages
- Network conditions vary (jitter, latency), so repetition smooths out fluctuations

**Example with `RESPONSE_TIME_REPETITIONS=10`**:
```
Test 1 transaction:
  - Run #1: 12274ms
  - Run #2: 12456ms
  - Run #3: 12246ms
  ... (10 total runs)
  - Average: 13173.8ms

Test 2 transactions:
  - Run #1: 24610ms
  - Run #2: 24951ms
  ... (10 total runs)
  - Average: 30348.9ms
```

**Why repetition matters**:
Network conditions vary, so a single test might give you `12000ms` one time and `25000ms` another. Repeating 10 times gives a more reliable average.

**Examples**:
```env
RESPONSE_TIME_REPETITIONS=10    # 10 measurements per transaction count (good accuracy)
RESPONSE_TIME_REPETITIONS=5     # 5 measurements per transaction count (2x faster, less accurate)
RESPONSE_TIME_REPETITIONS=3     # 3 measurements per transaction count (quick validation)
```

**Impact**:
- **Higher value** = More reliable averages, better statistical confidence
- **Lower value** = Faster testing, but results may be less stable

**Recommended values**:
- Quick test: `3`
- Standard test: `5-10`
- Research paper: `10-20`

---

#### `RESPONSE_TIME_LEVELS`
**Default**: `0,1,2,3`
**Purpose**: Which access control levels to test for response time

**How it works**:
- Comma-separated list of levels to test
- Same level definitions as gas testing

**Examples**:
```env
RESPONSE_TIME_LEVELS=0,1,2,3    # Test all 4 levels (default)
RESPONSE_TIME_LEVELS=3          # Only test Level 3
RESPONSE_TIME_LEVELS=0,2        # Only test Level 0 and Level 2
```

**Impact**:
- Fewer levels = Faster completion
- Testing all levels shows performance differences between access control complexity

---

## Total Test Calculation

### Response Time Tests
```
Total Tests = MAX_TX × REPETITIONS × Number of LEVELS
```

**Current default settings**:
```
MAX_TX = 20
REPETITIONS = 10
LEVELS = 4 (0,1,2,3)

Total = 20 × 10 × 4 = 800 tests
Estimated time: 2-3 hours
```

**Fast testing example**:
```env
RESPONSE_TIME_MAX_TX=10
RESPONSE_TIME_REPETITIONS=5
RESPONSE_TIME_LEVELS=0,3

Total = 10 × 5 × 2 = 100 tests
Estimated time: 15-30 minutes
```

---

### Gas Consumption Tests
```
Total Transactions = GAS_TEST_TRANSACTIONS × Number of LEVELS
```

**Current default settings**:
```
GAS_TEST_TRANSACTIONS = 100
LEVELS = 4 (0,1,2,3)

Total = 100 × 4 = 400 transactions
Estimated time: 30-60 minutes
```

**Fast testing example**:
```env
GAS_TEST_TRANSACTIONS=50
GAS_TEST_LEVELS=3

Total = 50 × 1 = 50 transactions
Estimated time: 5-10 minutes
```

---

## Recommended Configurations

### Quick Validation Test (10-15 minutes)
For quick validation that everything works:

```env
GAS_TEST_TRANSACTIONS=50
GAS_TEST_LEVELS=0,3
RESPONSE_TIME_MAX_TX=5
RESPONSE_TIME_REPETITIONS=3
RESPONSE_TIME_LEVELS=0,3
```

**Results**:
- Gas tests: 50 × 2 = 100 transactions
- Response time: 5 × 3 × 2 = 30 tests
- **Total: 130 operations**

---

### Standard Test (1-2 hours)
For decent data with reasonable time:

```env
GAS_TEST_TRANSACTIONS=100
GAS_TEST_LEVELS=0,1,2,3
RESPONSE_TIME_MAX_TX=10
RESPONSE_TIME_REPETITIONS=5
RESPONSE_TIME_LEVELS=0,1,2,3
```

**Results**:
- Gas tests: 100 × 4 = 400 transactions
- Response time: 10 × 5 × 4 = 200 tests
- **Total: 600 operations**

---

### Full Research Test (6-12 hours)
For comprehensive academic/client data:

```env
GAS_TEST_TRANSACTIONS=500
GAS_TEST_LEVELS=0,1,2,3
RESPONSE_TIME_MAX_TX=20
RESPONSE_TIME_REPETITIONS=10
RESPONSE_TIME_LEVELS=0,1,2,3
```

**Results**:
- Gas tests: 500 × 4 = 2000 transactions
- Response time: 20 × 10 × 4 = 800 tests
- **Total: 2800 operations**

---

### Focus on Level 3 Only (fastest)
If you only need data for the most complex level:

```env
GAS_TEST_TRANSACTIONS=100
GAS_TEST_LEVELS=3
RESPONSE_TIME_MAX_TX=20
RESPONSE_TIME_REPETITIONS=10
RESPONSE_TIME_LEVELS=3
```

**Results**:
- Gas tests: 100 × 1 = 100 transactions
- Response time: 20 × 10 × 1 = 200 tests
- **Total: 300 operations**
- **Estimated time: 30-60 minutes**

---

## How to Change Configuration

1. Open `.env` file in the `ethereum` folder
2. Modify the values under `# Test Configuration` section
3. Save the file
4. Run tests: `npm run test-all`

**Example .env section**:
```env
# Test Configuration
GAS_TEST_TRANSACTIONS=100
GAS_TEST_LEVELS=0,1,2,3
RESPONSE_TIME_MAX_TX=20
RESPONSE_TIME_REPETITIONS=10
RESPONSE_TIME_LEVELS=0,1,2,3
```

---

## Test Commands

### Run all tests (response time + gas consumption + generate Excel)
```bash
npm run test-all
```

### Run only response time tests
```bash
npm run test-response
```

### Run only gas consumption tests
```bash
npm run test-gas
```

### Generate Excel from existing test results
```bash
npm run export-excel
```

---

## Troubleshooting

### Tests are taking too long
- Reduce `GAS_TEST_TRANSACTIONS` (try `50` or `100`)
- Reduce `RESPONSE_TIME_MAX_TX` (try `10`)
- Reduce `RESPONSE_TIME_REPETITIONS` (try `3` or `5`)
- Test fewer levels (e.g., `GAS_TEST_LEVELS=3`)

### Network errors (ENOTFOUND)
- Tests will retry failed transactions after 5 second delay
- Progress is saved every 100 transactions
- Check your internet connection
- Verify Sepolia RPC URL is correct in `.env`

### Want more accurate results
- Increase `RESPONSE_TIME_REPETITIONS` (try `15` or `20`)
- Increase `GAS_TEST_TRANSACTIONS` (try `500` or `1000`)
- Test all levels: `GAS_TEST_LEVELS=0,1,2,3`

---

## Output Files

After tests complete, you'll find:

- `test-results/responseTime.json` - Raw response time data
- `test-results/gasConsumption.json` - Raw gas consumption data
- `test-results/ethereum-test-results.xlsx` - Excel report with all data

The Excel file contains:
- **Level 0-3 Response Time** sheets: Transaction count vs response time with repetitions
- **Gas Consumption Summary**: Overview of gas usage per level
- **Level 0-3 Gas Detail** sheets: Detailed gas usage for each transaction
