import {KirokuReport} from './reportTypes';
import * as fs from 'fs';
import * as path from 'path';

// Function to convert the report object to a Markdown string
function convertReportToMarkdown(report: KirokuReport): string {
  let markdown = '';
  report.sections.forEach(section => {
    markdown += `# ${section.title}\n\n`; // Section title
    section.items.forEach(item => {
      markdown += `## ${item.heading}\n`; // Item heading
      markdown += `${item.description}\n\n`; // Item description
      markdown += `**Value:** ${item.value}\n\n`; // Item value
    });
  });
  return markdown;
}

/**
 * Function to write the Markdown string to a .md file
 *
 * @example
 * const myReport: Report = {
 *   // ... your report object here
 * };
 * writeMarkdownToFile(myReport, 'MyReport');
 */
export function writeMarkdownToFile(
  report: KirokuReport,
  filename: string,
): void {
  const markdown = convertReportToMarkdown(report);
  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const filePath = path.join(outputDir, `${filename}.md`);
  fs.writeFile(filePath, markdown, err => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log(`Report written to ${filePath}`);
  });
}
