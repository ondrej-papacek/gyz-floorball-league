const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

function loadTemplate(templateName) {
    const templatePath = path.join(__dirname, 'templates', templateName);
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`);
    }
    return fs.readFileSync(templatePath, 'binary');
}

function generateDocxFromTemplate(templateName, data) {
    try {
        const content = loadTemplate(templateName);
        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            parser: tag => ({
                get: s => s === '.' ? tag : s,
            })
        });

        doc.setData(data);

        doc.render();
        return doc.getZip().generate({ type: 'nodebuffer' });
    } catch (error) {
        console.error('[DOCX UTILS] Template render error:', error);
        console.error('[DOCX UTILS] Problematic data:', JSON.stringify(data, null, 2));
        throw error;
    }
}

module.exports = {
    generateDocxFromTemplate
};
