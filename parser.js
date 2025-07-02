const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to parse quantity from item string
function parseQuantity(item) {
    // Look for patterns like (2x), (12), 2x, etc.
    const quantityMatch = item.match(/\((\d+)(?:x)?\)|(\d+)x/);
    if (quantityMatch) {
        return parseInt(quantityMatch[1] || quantityMatch[2]);
    }
    return 1; // Default quantity
}

// Function to clean item name by removing quantity indicators
function cleanItemName(item) {
    return item.replace(/\(\d+(?:x)?\)|\d+x/, '').trim();
}

// Function to check if a line is a category header
function isCategoryHeader(line) {
    // Check for lines ending with dash or common category patterns
    return line.endsWith('-') || 
           line.toLowerCase().includes('meats') ||
           line.toLowerCase().includes('pantry') ||
           line.toLowerCase().includes('seasonings') ||
           line.toLowerCase().includes('cleaning supplies') ||
           line.toLowerCase().includes('toiletries') ||
           line.toLowerCase().includes('miscellaneous') ||
           line.toLowerCase().includes('bagged lunch');
}

// Function to clean category name
function cleanCategoryName(category) {
    return category.replace(/^-+$/, '').trim();
}

// Function to parse the items.txt file
function parseItemsFile(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const groceryItems = [];
    let currentCategory = '';
    
    for (const line of lines) {
        // Check if line is a category header
        if (isCategoryHeader(line)) {
            currentCategory = cleanCategoryName(line);
        } else if (currentCategory && line.length > 0) {
            // Skip lines that are just dots, empty, or whitespace
            if (line === '.' || line === '' || line === ' ') continue;
            
            // Clean the item name (remove leading dots and extra spaces)
            let cleanLine = line.replace(/^\.+\s*/, '').trim();
            
            // Skip if the cleaned line is empty
            if (cleanLine.length === 0) continue;
            
            const quantity = parseQuantity(cleanLine);
            const itemName = cleanItemName(cleanLine);
            
            // Only add if we have a valid item name
            if (itemName.length > 0) {
                groceryItems.push({
                    category: currentCategory,
                    item: itemName,
                    quantity: quantity
                });
            }
        }
    }
    
    return groceryItems;
}

// Main execution
async function main() {
    try {
        console.log('🟩 Parsing items.txt...');
        
        // Parse the items file
        const items = parseItemsFile('items.txt');
        
        console.log(`Found ${items.length} items across ${new Set(items.map(item => item.category)).size} categories`);
        
        // Create CSV writer
        const csvWriter = createCsvWriter({
            path: 'grocery-list.csv',
            header: [
                { id: 'category', title: 'category' },
                { id: 'item', title: 'item' },
                { id: 'quantity', title: 'quantity' }
            ]
        });
        
        // Write to CSV
        await csvWriter.writeRecords(items);
        
        console.log('✅ Successfully created grocery-list.csv');
        console.log('\n📋 Sample of parsed items:');
        items.slice(0, 10).forEach(item => {
            console.log(`  ${item.category}: ${item.item} (${item.quantity})`);
        });
        
        // Show category breakdown
        console.log('\n📊 Category breakdown:');
        const categoryCount = {};
        items.forEach(item => {
            categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });
        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} items`);
        });
        
    } catch (error) {
        console.error('❌ Error parsing items:', error.message);
        process.exit(1);
    }
}

// Run the parser
main(); 