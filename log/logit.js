const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFilename = `session_log_${timestamp}.txt`;
const logFilePath = path.join(logDir, logFilename);

const logTemplate = `# Session Log - ${new Date().toLocaleString()}

## Actions Taken
- 

## Results
- 

## Understanding the Results
- 

## Lessons Learned
- 

## File Documentation
- 

## Next Steps
- 

`;

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Create a new log file with the template
fs.writeFileSync(logFilePath, logTemplate);

console.log(`Log template created at ${logFilePath}`);
