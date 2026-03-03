const fs = require('fs');
const path = require('path');

const directoriesToScan = ['app', 'components', 'lib', 'types', 'documents'];
const basePath = '/Users/kimhongkyun/Crealab/crealab-platform';

const replacements = [
    { from: /'brand_offer'/g, to: "'product_apply'" },
    { from: /"brand_offer"/g, to: '"product_apply"' },
    { from: /'creator_apply'/g, to: "'campaign_apply'" },
    { from: /"creator_apply"/g, to: '"campaign_apply"' },
    { from: /\bbrandProposals\b/g, to: "productApplications" },
    { from: /\bcreateBrandProposal\b/g, to: "createProductApplication" },
    { from: /\bupdateBrandProposal\b/g, to: "updateProductApplication" },
    { from: /\bdeleteBrandProposal\b/g, to: "deleteProductApplication" },
    { from: /\bsetBrandProposals\b/g, to: "setProductApplications" }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'ui') continue;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            for (const { from, to } of replacements) {
                content = content.replace(from, to);
            }

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath.replace(basePath, '')}`);
            }
        }
    }
}

try {
    for (const dir of directoriesToScan) {
        processDirectory(path.join(basePath, dir));
    }
    console.log("Done renaming.");
} catch (e) {
    console.error(e);
}
