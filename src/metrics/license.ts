import * as fs from 'fs';
import * as path from 'path';

// Pre-defined list of licenses compatible with LGPL-2.1
const compatibleLicenses = ['LGPL-2.1', 'GPL-2.0', 'GPL-3.0', 'LGPL-3.0', 'Apache-2.0', 
    'MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'X11', 'ISC', 
    'Zlib', 'PSF-2.0', 'Boost-1.0', 'CC0', 'EPL-1.0', 
    'EPL-2.0', 'MPL-2.0', 'Artistic-2.0', 'Public Domain'];

// Helper function to read and extract license information from a file
async function extractLicenseFromFile(filePath: string): Promise<string | null> {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Regex to match common license patterns
    const licenseRegex = /(LGPL-2.1|GPL-2.0|GPL-3.0|LGPL-3.0|Apache-2.0|MIT|BSD-2-Clause|BSD-3-Clause|X11|ISC|Zlib|PSF-2.0|Boost-1.0|CC0|EPL-1.0|EPL-2.0|MPL-2.0|Artistic-2.0|Public Domain)/i;
    const match = fileContent.match(licenseRegex);

    return match ? match[1] : null;
}

// Main function to calculate the license score
export async function calculateLicenseCompatibility(repoPath: string): Promise<number> {
    try {
        // Check for LICENSE file first
        let licenseType = await extractLicenseFromFile(path.join(repoPath, 'LICENSE'));

        // If LICENSE file doesn't exist or no license type is found, check README.md
        if (!licenseType) {
            licenseType = await extractLicenseFromFile(path.join(repoPath, 'README.md'));
        }

        // Check if the license is compatible
        if (licenseType && compatibleLicenses.includes(licenseType.toUpperCase())) {
            return 1; // License is compatible
        } else {
            return 0; // License is not compatible
        }
    } catch (error) {
        console.error(`Error calculating license compatibility: ${error}`);
        return 0;
    }
}