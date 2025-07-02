# 🛒 Grocery Form Automation with Playwright

A complete Node.js-based proof-of-concept project for automating form submissions using Playwright, based on a vendor's grocery/product list in a plain text file.

## 📁 Project Structure

```
project-root/
├── items.txt              # Input file with unstructured grocery list
├── grocery-list.csv       # Generated CSV file (output of parser)
├── form.html              # Static HTML form for testing
├── parser.js              # Text parser to convert items.txt to CSV
├── autoSubmit.js          # Playwright automation script
├── form.spec.js           # Playwright test suite (single window demo)
├── playwright.config.js   # Playwright configuration
├── package.json           # Node.js dependencies and scripts
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Parse the Grocery List

```bash
npm run parse
```

This will read `items.txt` and generate `grocery-list.csv` with structured data.

### 4. Run Playwright Tests (Single Window Demo)

```bash
npm test
```

This will:
- Launch a single Chromium browser window (visible UI with 300ms slowMo)
- Read all items from `grocery-list.csv`
- Test each item sequentially in the same browser window/tab
- Fill and submit the form for each item
- Assert success messages and form reset
- Wait 1.5 seconds between submissions for demo visibility

### 5. Alternative: Manual Server + Automation

If you prefer to run the server manually:

```bash
# Terminal 1: Start server
npm run serve

# Terminal 2: Run automation script
npm run automate
```

## 📋 Detailed Usage

### Part 1: Text Parser (`parser.js`)

The parser reads `items.txt` and extracts:
- **Categories**: Lines ending with `-` (e.g., "Breakfast-")
- **Items**: Lines under each category
- **Quantities**: Extracted from patterns like `(2x)`, `(12)`, `2x`
- **Default quantity**: 1 if not specified

**Input Format Example:**
```
Breakfast-
Sausage patties
French toast sticks (2x)
Waffles (2x)

Dairy-
Milk gal
Shredded cheese
```

**Output CSV Format:**
```csv
category,item,quantity
Breakfast,Sausage patties,1
Breakfast,French toast sticks,2
Breakfast,Waffles,2
Dairy,Milk gal,1
Dairy,Shredded cheese,1
```

### Part 2: Web Form (`form.html`)

A beautiful, responsive HTML form with:
- Category input field
- Item name input field  
- Quantity number input
- Submit button with success feedback
- Form reset after submission
- Modern UI with animations

### Part 3: Playwright Tests (`form.spec.js`)

The test suite features a **single window demo** approach:
1. Launches one Chromium browser window that stays open for all tests
2. Reads all rows from `grocery-list.csv` synchronously during test discovery
3. For each item:
   - Navigates to `http://localhost:3000/form.html` in the same tab
   - Fills in category, item, and quantity using `input[name="..."]` selectors
   - Asserts input fields contain expected values before submission
   - Clicks submit button
   - Waits for success message with text "Submission Successful"
   - Verifies form resets after submission
   - Waits 1.5 seconds for demo visibility
4. Uses Chromium with `headless: false` and `slowMo: 300ms`
5. Perfect for live demonstrations and presentations

### Part 4: Playwright Automation (`autoSubmit.js`)

The automation script:
1. Reads `grocery-list.csv`
2. Launches Chromium browser (visible UI)
3. For each row:
   - Navigates to `http://localhost:3000/form.html`
   - Fills in category, item, and quantity
   - Submits the form
   - Waits for success message
   - Proceeds to next item
4. Includes random delays to simulate human behavior
5. Error handling for individual items

## 🛠️ Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `parse` | `npm run parse` | Parse items.txt and generate grocery-list.csv |
| `serve` | `npm run serve` | Start static web server on localhost:3000 |
| `test` | `npm test` | Run Playwright tests (single window demo) |
| `test:ui` | `npm run test:ui` | Run tests with Playwright UI mode |
| `test:headed` | `npm run test:headed` | Run tests with headed browser |
| `automate` | `npm run automate` | Run Playwright automation script |

## 📦 Dependencies

- **csv-writer**: Generate CSV files from JavaScript objects
- **csv-parser**: Parse CSV files in Node.js
- **playwright**: Browser automation framework
- **@playwright/test**: Playwright test runner
- **serve**: Static file server for development

## 🔧 Configuration

### Playwright Test Configuration (`playwright.config.js`)
- **Browser**: Chromium with `headless: false`
- **SlowMo**: 300ms for demo visibility
- **Mode**: Sequential execution (`fullyParallel: false`)
- **WebServer**: Automatically starts server before tests
- **Reporter**: HTML report generation

### Single Window Demo Features
- **Browser Reuse**: Single browser window for all tests
- **Page Reuse**: Same tab for continuous flow
- **Demo Timing**: 1.5 second wait between submissions
- **Visual Feedback**: Console logging for each test step

### Browser Settings
- **Headless**: `false` (visible browser for demonstration)
- **SlowMo**: 300ms (slows down actions for visibility)
- **Viewport**: Desktop Chrome size

### Timing
- **Form submission delay**: 300ms (via slowMo)
- **Demo wait time**: 1.5 seconds between items
- **Success message timeout**: 10 seconds
- **Form ready timeout**: 10 seconds

## 🐛 Troubleshooting

### Common Issues

1. **"grocery-list.csv not found"**
   - Run `npm run parse` first to generate the CSV file

2. **"Server is not running"**
   - Tests automatically start the server, but if manual: `npm run serve`

3. **Playwright browser not launching**
   - Install browsers: `npx playwright install`

4. **Form not loading**
   - Ensure server is running on port 3000
   - Check if `form.html` exists in the project root

5. **Tests failing**
   - Check that `grocery-list.csv` exists and has valid data
   - Verify form selectors match the HTML structure

6. **Multiple browser windows opening**
   - The single window demo should only open one browser window
   - If you see multiple windows, check that you're using the updated `form.spec.js`

### Debug Mode

To see detailed browser actions, the tests run with:
- `headless: false` - Shows browser window
- `slowMo: 300` - Slows down actions
- Console logging for each step
- HTML report generation
- Single window for continuous demo flow

## 📝 Customization

### Adding New Quantity Patterns

Edit `parser.js` and modify the `parseQuantity` function:

```javascript
function parseQuantity(item) {
    // Add your custom patterns here
    const quantityMatch = item.match(/\((\d+)(?:x)?\)|(\d+)x|your-pattern/);
    if (quantityMatch) {
        return parseInt(quantityMatch[1] || quantityMatch[2]);
    }
    return 1;
}
```

### Modifying Form Fields

Edit `form.html` to add/remove form fields, then update `form.spec.js` to handle the new fields.

### Changing Server Port

If you need to use a different port, update:
1. The `serve` command in `package.json`
2. The URL in `form.spec.js` and `autoSubmit.js`
3. The `webServer.url` in `playwright.config.js`

### Test Configuration

Modify `playwright.config.js` to:
- Change browser type
- Adjust slowMo timing
- Enable/disable headless mode
- Configure parallel execution

### Demo Timing

To adjust the demo wait time between submissions, modify the `waitForTimeout` value in `form.spec.js`:
```javascript
// Wait for demo visibility (adjust this value)
await page.waitForTimeout(1500); // 1.5 seconds
```

## 🎯 Example Workflow

1. **Prepare your grocery list** in `items.txt`
2. **Parse the list**: `npm run parse`
3. **Run tests**: `npm test`
4. **Watch the magic happen** as Playwright fills and submits each item in a single browser window!

## 🎬 Demo Features

The single window demo is perfect for:
- **Live presentations** - One browser window shows the entire automation flow
- **Client demonstrations** - Easy to follow the step-by-step process
- **Training sessions** - Visual feedback for each form submission
- **Debugging** - See exactly what's happening in real-time

## 📄 License

MIT License - feel free to use this project for your own automation needs! 