const { chromium } = require('playwright');
const csv = require('csv-parser');
const fs = require('fs');

// Function to read CSV file
function readCsvFile(filename) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

// Function to wait for a random amount of time (simulates human behavior)
function randomDelay(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Main automation function
async function automateFormSubmissions() {
    let browser;
    let page;
    
    try {
        console.log('🚀 Starting Playwright automation...');
        
        // Check if CSV file exists
        if (!fs.existsSync('grocery-list.csv')) {
            console.error('❌ grocery-list.csv not found. Please run the parser first: npm run parse');
            process.exit(1);
        }
        
        // Read the CSV file
        console.log('📖 Reading grocery-list.csv...');
        const items = await readCsvFile('grocery-list.csv');
        
        if (items.length === 0) {
            console.error('❌ No items found in grocery-list.csv');
            process.exit(1);
        }
        
        console.log(`📋 Found ${items.length} items to process`);
        
        // Launch browser
        console.log('🌐 Launching browser...');
        browser = await chromium.launch({ 
            headless: false, // Show browser UI for demonstration
            slowMo: 500 // Slow down actions for better visibility
        });
        
        page = await browser.newPage();
        
        // Set viewport
        await page.setViewportSize({ width: 1200, height: 800 });
        
        // Process each item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            console.log(`\n🔄 Processing item ${i + 1}/${items.length}: ${item.item} (${item.quantity})`);
            
            try {
                // Navigate to the form
                await page.goto('http://localhost:3000/form.html', { 
                    waitUntil: 'networkidle' 
                });
                
                // Wait for form to be ready
                await page.waitForSelector('#category', { timeout: 10000 });
                
                // Fill in the form fields
                await page.fill('#category', item.category);
                await page.fill('#item', item.item);
                await page.fill('#quantity', item.quantity.toString());
                
                // Add a small delay before submitting
                await randomDelay(500, 1500);
                
                // Submit the form
                await page.click('.submit-btn');
                
                // Wait for success message
                await page.waitForSelector('#successMessage', { 
                    state: 'visible',
                    timeout: 10000 
                });
                
                console.log(`✅ Successfully submitted: ${item.category} - ${item.item} (${item.quantity})`);
                
                // Wait a bit before processing next item
                await randomDelay(2000, 4000);
                
            } catch (error) {
                console.error(`❌ Error processing item ${item.item}:`, error.message);
                // Continue with next item instead of stopping
            }
        }
        
        console.log('\n🎉 Automation completed successfully!');
        
    } catch (error) {
        console.error('❌ Automation failed:', error.message);
        process.exit(1);
    } finally {
        // Clean up
        if (page) {
            await page.close();
        }
        if (browser) {
            await browser.close();
        }
        console.log('🧹 Browser closed');
    }
}

// Function to check if the server is running
async function checkServer() {
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:3000/form.html', { 
            timeout: 5000,
            waitUntil: 'networkidle' 
        });
        await browser.close();
        return true;
    } catch (error) {
        await browser.close();
        return false;
    }
}

// Main execution
async function main() {
    console.log('🔍 Checking if server is running...');
    
    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.error('❌ Server is not running on http://localhost:3000');
        console.log('💡 Please start the server first: npm run serve');
        process.exit(1);
    }
    
    console.log('✅ Server is running on http://localhost:3000');
    
    // Start automation
    await automateFormSubmissions();
}

// Run the automation
main().catch(console.error); 