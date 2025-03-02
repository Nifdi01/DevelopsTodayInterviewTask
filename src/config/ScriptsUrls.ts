import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import axios from 'axios';
import { pipeline } from 'stream/promises';

const args = process.argv.slice(2);
let filePath = './src/data/articles_dataset.csv'; // Default path

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--file=')) {
    filePath = args[i].substring(7);
  }
}

interface CsvRow {
  URL: string;
  Source?: string;
  [key: string]: string | undefined;
}

interface ProcessingResult {
  url: string;
  source: string;
  result: any;
}

async function processCsvUrls(filePath: string): Promise<void> {
  try {
    const resolvedPath = path.resolve(filePath);
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`);
    }

    console.log(`Processing CSV file: ${resolvedPath}`);
    
    const csvStream = fs.createReadStream(resolvedPath);
    
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    let processedCount = 0;
    let errorCount = 0;
    const results: ProcessingResult[] = [];
    
    await pipeline(
      csvStream,
      parser,
      async function* (rows: any) {
        for (const row of rows) {
          const csvRow = row as CsvRow;
          
          if (!csvRow.URL) {
            console.warn('Row missing URL, skipping');
            continue;
          }
          
          try {
            const result = await processUrl(csvRow.URL);
            results.push({
              url: csvRow.URL,
              source: csvRow.Source || 'Unknown',
              result
            });
            
            processedCount++;
            console.log(`Processed URL (${processedCount}): ${csvRow.URL}`);
            yield result;
          } catch (error: any) {
            errorCount++;
            console.error(`Error processing URL (${csvRow.URL}): ${error.message}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    );
    
    const resultsPath = path.join(path.dirname(resolvedPath), 'processing_results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    console.log(`Finished processing. Successful: ${processedCount}, Errors: ${errorCount}`);
    console.log(`Results saved to: ${resultsPath}`);
  } catch (error: any) {
    console.error(`Error processing CSV file: ${error.message}`);
    process.exit(1);
  }
}

async function processUrl(url: string): Promise<any> {
  try {
    const endpoint = 'http://localhost:3000/agent/';
    
    const response = await axios.post(endpoint, {
      query: url
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`Error querying API for URL ${url}: ${error.message}`);
    throw error;
  }
}

processCsvUrls(filePath);