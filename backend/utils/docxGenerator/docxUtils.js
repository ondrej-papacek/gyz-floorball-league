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

    try {
        doc.render();
    } catch (error) {
        console.error("Docx rendering error:", error);
        throw error;
    }

    return doc.getZip().generate({ type: 'nodebuffer' });
}

module.exports = {
    generateDocxFromTemplate
};
