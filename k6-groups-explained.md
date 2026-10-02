# k6 Groups Explained

## **What are Groups in k6?**

Groups in k6 are a way to **organize your test logic** into logical sections. They help structure your test scenarios and provide separate timing metrics for different parts of your test.

## **Key Benefits of Groups**

1. **Logical Organization**: Separate different test phases (setup, main test, cleanup)
2. **Individual Timing**: Each group gets its own performance metrics
3. **Better Analysis**: Easier to identify which part of your test is slow
4. **Threshold Management**: Set different performance requirements per group
5. **Improved Reporting**: Clear separation in test results

## **Basic Group Syntax**

```javascript
import { group } from 'k6';

export default function () {
  group('Group Name', function () {
    // Your test logic here
    // HTTP requests, checks, etc.
  });
}
```

## **Real Example with Groups**

```javascript
// tags_custom_k6.js demonstrates three groups:

// Group 1: Page Tests
group('Page Tests', function () {
  // Test website pages (homepage, contact)
  // Takes longer due to 2 requests + sleeps
});

// Group 2: API Tests  
group('API Tests', function () {
  // Test API endpoints
  // Faster execution, single request
});

// Group 3: Business Logic
group('Business Logic', function () {
  // Custom validation and metric recording
  // Very fast, just logic
});
```

## **Groups in k6 Output**

When you run a test with groups, you'll see:

### **1. Group-Specific Thresholds**
```
THRESHOLDS
  group_duration{group:::Page Tests}
  ✗ 'avg<1000' avg=2.04s                    // Page tests took too long
  
  group_duration{group:::API Tests}  
  ✓ 'avg<500' avg=250.74ms                  // API tests were fast enough
  
  checks{group:::Page Tests}
  ✗ 'rate>0.8' rate=75.00%                  // Page tests had some failures
  
  checks{group:::API Tests}
  ✓ 'rate>0.95' rate=100.00%                // API tests all passed
```

### **2. Execution Metrics**
```
EXECUTION
  iteration_duration: avg=4.29s             // Total iteration time
  group_duration{group:::Page Tests}: 2.04s  // Time spent in Page Tests group
  group_duration{group:::API Tests}: 250ms   // Time spent in API Tests group
```

## **Group Threshold Examples**

```javascript
export const options = {
  thresholds: {
    // Overall performance
    'http_req_duration': ['p(95)<500'],
    
    // Group-specific performance
    'group_duration{group:::Page Tests}': ['avg<1000'],     // Page tests < 1s
    'group_duration{group:::API Tests}': ['avg<500'],       // API tests < 500ms
    
    // Group-specific checks
    'checks{group:::Page Tests}': ['rate>0.8'],             // 80% page checks pass
    'checks{group:::API Tests}': ['rate>0.95'],             // 95% API checks pass
  },
};
```

## **When to Use Groups**

### **✅ Good Use Cases**
- **Multi-phase tests**: Login → Browse → Purchase → Logout
- **Different test types**: UI tests vs API tests vs Database tests
- **Performance analysis**: Identify slow sections
- **Mixed workloads**: Heavy setup + light operations
- **Reporting clarity**: Separate metrics for different features

### **❌ Not Needed When**
- Simple single-purpose tests
- All requests are similar
- No need for separate timing analysis

## **Groups vs Tags vs Custom Metrics**

| Feature | Purpose | Output Location | Use Case |
|---------|---------|-----------------|----------|
| **Groups** | Organize test logic | Separate timing metrics | Structure test phases |
| **Tags** | Filter requests | Built-in metric breakdowns | Per-endpoint analysis |
| **Custom Metrics** | Business logic | CUSTOM section | Domain-specific tracking |

## **Advanced Group Patterns**

### **1. Nested Groups**
```javascript
group('User Journey', function () {
  group('Authentication', function () {
    // Login logic
  });
  
  group('Shopping', function () {
    // Browse and purchase
  });
  
  group('Checkout', function () {
    // Payment processing
  });
});
```

### **2. Conditional Groups**
```javascript
if (userType === 'premium') {
  group('Premium Features', function () {
    // Premium user tests
  });
} else {
  group('Standard Features', function () {
    // Standard user tests
  });
}
```

### **3. Data-Driven Groups**
```javascript
const testScenarios = ['mobile', 'desktop', 'tablet'];

testScenarios.forEach(scenario => {
  group(`${scenario} Tests`, function () {
    // Scenario-specific tests
  });
});
```

## **Best Practices**

1. **Meaningful Names**: Use descriptive group names
2. **Logical Separation**: Group related operations together
3. **Consistent Structure**: Same groups across test iterations
4. **Performance Focus**: Group by performance characteristics
5. **Don't Over-Group**: Avoid too many small groups

## **Common Patterns**

### **User Journey Testing**
```javascript
group('Login Flow', function () { /* login logic */ });
group('Main Workflow', function () { /* core functionality */ });
group('Logout Flow', function () { /* cleanup */ });
```

### **API Testing**
```javascript
group('Authentication APIs', function () { /* auth endpoints */ });
group('Data APIs', function () { /* CRUD operations */ });
group('Search APIs', function () { /* search functionality */ });
```

### **Mixed Testing**
```javascript
group('Setup Phase', function () { /* initialization */ });
group('Load Testing', function () { /* high-volume requests */ });
group('Validation Phase', function () { /* result verification */ });
```

Groups provide powerful test organization and analysis capabilities, making your k6 tests more maintainable and your results more actionable!
