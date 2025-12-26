const fs = require('fs');
const path = require('path');

// Output file
const outputFile = 'project_summary.txt';
let output = '';

// Function to recursively generate tree view
function generateTree(dir, indent = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (item === 'node_modules') continue;
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        output += `${indent}- ${item}\n`;
        if (stats.isDirectory()) {
            generateTree(fullPath, indent + '  ');
        }
    }
}

// Function to read first few lines of a file
function readFirstLines(filePath, numLines = 10) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').slice(0, numLines).join('\n');
        return lines;
    } catch (err) {
        return `Error reading ${filePath}: ${err.message}`;
    }
}

// Start summarizing
output += '--- Project Directory Tree ---\n';
generateTree('.', '');
output += '\n--- package.json ---\n';
if (fs.existsSync('package.json')) {
    output += fs.readFileSync('package.json', 'utf8') + '\n';
} else {
    output += 'package.json not found\n';
}

// Scan for main JS/TS files
output += '\n--- Main JS/TS Files (First 10 lines) ---\n';
function scanFiles(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory() && item !== 'node_modules') {
            scanFiles(fullPath);
        } else if (stats.isFile() && (item.endsWith('.js') || item.endsWith('.ts'))) {
            output += `\nFile: ${fullPath}\n`;
            output += readFirstLines(fullPath) + '\n';
        }
    }
}
scanFiles('.');

// Include README.md if present
output += '\n--- README.md ---\n';
if (fs.existsSync('README.md')) {
    output += fs.readFileSync('README.md', 'utf8') + '\n';
} else {
    output += 'README.md not found\n';
}

// Write to output file
fs.writeFileSync(outputFile, output);
console.log(`Project summary saved to ${outputFile}`);
