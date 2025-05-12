const fs = require("fs");
const path = require("path");
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    AlignmentType,
} = require("docx");

async function generateRoundPreviewDoc(roundData) {
    const { round, date, matches = [] } = roundData;

    const roundDateObj = new Date(date);
    const formattedDate = !isNaN(roundDateObj)
        ? roundDateObj.toLocaleDateString("cs-CZ")
        : "---";

    // Load logos
    const logoPath = path.join(__dirname, "assets", "logo.png");
    const logoTextPath = path.join(__dirname, "assets", "logo-text.jpg");

    const logoImage = fs.readFileSync(logoPath);
    const logoTextImage = fs.readFileSync(logoTextPath);

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            width: 11900,
                            height: 16840,
                        },
                        margin: {
                            top: 720,
                            bottom: 720,
                            left: 720,
                            right: 720,
                        },
                    },
                },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: logoImage,
                                transformation: {
                                    width: 150,
                                    height: 150,
                                },
                            }),
                        ],
                    }),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: `Kolo ${round}`,
                                bold: true,
                                size: 36,
                            }),
                        ],
                    }),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: formattedDate,
                                size: 28,
                            }),
                        ],
                    }),

                    new Paragraph({ text: "" }),

                    ...matches.map((match, i) => {
                        const teamA = match.teamA || "---";
                        const teamB = match.teamB || "---";
                        return new Paragraph({
                            alignment: AlignmentType.LEFT,
                            spacing: { after: 200 },
                            children: [
                                new TextRun({
                                    text: `Zápas ${i + 1}: ${teamA} vs ${teamB}`,
                                    size: 26,
                                }),
                            ],
                        });
                    }),

                    new Paragraph({ text: "" }),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: logoTextImage,
                                transformation: {
                                    width: 250,
                                    height: 60,
                                },
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateRoundPreviewDoc,
};
