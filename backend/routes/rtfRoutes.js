const express = require('express');
const router = express.Router();
const { generateRoundPreviewDoc } = require('../utils/rtfGenerator/generateRoundPreview');
const { generateSeasonSummaryDoc } = require('../utils/rtfGenerator/generateSeasonSummary');

router.post('/generate-round', async (req, res, next) => {
    try {
        console.log('[RTF ROUTE] /generate-round triggered');
        const roundData = req.body;
        console.log('[RTF ROUTE] Received payload:', JSON.stringify(roundData, null, 2));

        const docBuffer = await generateRoundPreviewDoc(roundData);

        res.setHeader('Content-Type', 'application/rtf');
        res.setHeader('Content-Disposition', 'attachment; filename=round-preview.rtf');
        res.send(docBuffer);
    } catch (err) {
        console.error('[RTF ROUTE] Error generating round RTF:', err);
        res.status(500).json({
            error: 'RTF generation failed',
            message: err.message || 'Unknown error occurred'
        });
    }
});

router.post('/generate-summary', async (req, res, next) => {
    try {
        const seasonData = req.body;
        const docBuffer = await generateSeasonSummaryDoc(seasonData);

        res.setHeader('Content-Type', 'application/rtf');
        res.setHeader('Content-Disposition', 'attachment; filename=season-summary.rtf');
        res.send(docBuffer);
    } catch (err) {
        console.error('[RTF ROUTE] Error generating season RTF:', err);
        res.status(500).json({
            error: 'RTF generation failed',
            message: err.message || 'Unknown error occurred'
        });
    }
});

module.exports = router;
