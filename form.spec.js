const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const csv = require('csv-parser');

// Function to read all rows from CSV file synchronously for test discovery
function readCsvFileSync(filename) {
  const results = [];
  const fileContent = fs.readFileSync(filename, 'utf8');
  const lines = fileContent.split('\n');
  const headers = lines[0].split(',');
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',');
      const item = {};
      headers.forEach((header, index) => {
        item[header.trim()] = values[index] ? values[index].trim() : '';
      });
      results.push(item);
    }
  }
  
  return results;
}

// Read CSV file for test generation
const groceryItems = readCsvFileSync('grocery-list.csv');

test.describe('Grocery Form Automation (Single Window Demo)', () => {
  let browser;
  let page;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: false, slowMo: 300 });
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('should have grocery items to test', async () => {
    expect(groceryItems).toBeDefined();
    expect(groceryItems.length).toBeGreaterThan(0);
    console.log(`✅ Found ${groceryItems.length} items to test`);
  });

  // Generate a test for each grocery item
  for (const [i, item] of groceryItems.entries()) {
    test(`should submit: ${item.category} - ${item.item} (${item.quantity})`, async () => {
      console.log(`\n🔄 Testing: ${item.category} - ${item.item} (${item.quantity})`);
      
      await page.goto('http://localhost:3000/form.html');
      await page.fill('input[name="category"]', item.category);
      await page.fill('input[name="item"]', item.item);
      await page.fill('input[name="quantity"]', item.quantity.toString());

      // Assert input values before submit
      await expect(page.locator('input[name="category"]')).toHaveValue(item.category);
      await expect(page.locator('input[name="item"]')).toHaveValue(item.item);
      await expect(page.locator('input[name="quantity"]')).toHaveValue(item.quantity.toString());

      await page.click('.submit-btn');
      await expect(page.locator('#successMessage')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#successMessage')).toContainText('Submission Successful');

      // Assert form reset
      await expect(page.locator('input[name="category"]')).toHaveValue('');
      await expect(page.locator('input[name="item"]')).toHaveValue('');
      await expect(page.locator('input[name="quantity"]')).toHaveValue('1');

      // Wait for demo visibility
      await page.waitForTimeout(1500);
    });
  }
});

// Additional test to verify CSV structure
test.describe('CSV Structure Validation', () => {
  test('should have correct CSV structure', async () => {
    expect(groceryItems.length).toBeGreaterThan(0);
    
    // Check that each row has the required columns
    groceryItems.forEach((item, index) => {
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('item');
      expect(item).toHaveProperty('quantity');
      // Validate quantity is a number
      expect(parseInt(item.quantity)).not.toBeNaN();
      expect(parseInt(item.quantity)).toBeGreaterThan(0);
    });
    
    console.log(`✅ CSV structure validation passed for ${groceryItems.length} items`);
  });
}); 