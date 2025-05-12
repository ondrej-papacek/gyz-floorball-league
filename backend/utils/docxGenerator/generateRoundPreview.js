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

    const logoPath = path.join(__dirname, "assets", "logo.png");
    const logoTextPath = path.join(__dirname, "assets", "logo-text.jpg");
    const logoImage = fs.readFileSync(logoPath);
    const logoTextImage = fs.readFileSync(logoTextPath);

    const matchParagraphs = matches.map((match, i) => {
        const teamA = match.teamA || "---";
        const teamB = match.teamB || "---";

        return new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
                new TextRun({
                    text: `Zápas ${i + 1}: ${teamA} vs ${teamB}`,
                    size: 26,
                }),
            ],
        });
    });

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Cambria",
                    },
                    paragraph: {
                        spacing: { line: 276 },
                    },
                },
            },
        },
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
                    // Logo
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
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
                            new TextRun({ text: `Kolo ${round}`, bold: true, size: 36 }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [
                            new TextRun({ text: formattedDate, size: 28 }),
                        ],
                    }),

                    ...matchParagraphs,

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 600 },
                        children: [
                            new ImageRun({
                                data: logoTextImage,
                                transformation: {
                                    width: 150,
                                    height: 37,
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
