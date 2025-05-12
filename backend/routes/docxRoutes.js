const express = require('express');
const router = express.Router();
const { generateRoundPreviewDoc } = require('../utils/docxGenerator/generateRoundPreview');
const { generateSeasonSummaryDoc } = require('../utils/docxGenerator/generateSeasonSummary');

router.post('/generate-round', async (req, res, next) => {
    try {
        console.log('[DOCX ROUTE] /generate-round triggered');
        const roundData = req.body;
        console.log('[DOCX ROUTE] Received payload:', JSON.stringify(roundData, null, 2));

        const docBuffer = await generateRoundPreviewDoc(roundData);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=round-preview.docx');
        res.send(docBuffer);
    } catch (err) {
        console.error('[DOCX ROUTE] Error generating round DOCX:', err);
        res.status(500).json({
            error: 'DOCX generation failed',
            message: err.message || 'Unknown error occurred'
        });
    }
});

router.post('/generate-summary', async (req, res, next) => {
    try {
        const seasonData = req.body;
        const docBuffer = await generateSeasonSummaryDoc(seasonData);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=season-summary.docx');
        res.send(docBuffer);
    } catch (err) {
        console.error('[DOCX ROUTE] Error generating season DOCX:', err);
        res.status(500).json({
            error: 'DOCX generation failed',
            message: err.message || 'Unknown error occurred'
        });
    }
});

module.exports = router;
