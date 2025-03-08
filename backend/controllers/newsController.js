const db = require('../firebase'); // Firestore setup

// Fetch all news articles, sorted by date
exports.getNews = async (req, res, next) => {
    try {
        const snapshot = await db.collection('news').orderBy('date', 'desc').get(); // Order by date descending
        const news = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(news);
    } catch (error) {
        console.error('Chyba při načítání novinek:', error);
        res.status(500).json({ error: 'Nepodařilo se načíst novinky.' });
    }
};

// Add a new news article
exports.addNews = async (req, res, next) => {
    try {
        const { title, shortDescription, longDescription, image, date } = req.body;
        const newArticle = { title, shortDescription, longDescription, image, date: date || new Date().toISOString() };
        const docRef = await db.collection('news').add(newArticle); // Add to Firestore
        res.status(201).json({ id: docRef.id, ...newArticle });
    } catch (error) {
        console.error('Chyba při přidávání novinky:', error);
        res.status(500).json({ error: 'Nepodařilo se přidat novinku.' });
    }
};

// Update an existing news article
exports.updateNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const docRef = db.collection('news').doc(id); // Reference to the document
        await docRef.update(updatedData); // Update Firestore document
        res.status(200).json({ id, ...updatedData });
    } catch (error) {
        console.error('Chyba při úpravě novinky:', error);
        res.status(500).json({ error: 'Nepodařilo se upravit novinku.' });
    }
};

// Delete a news article
exports.deleteNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('news').doc(id); // Reference to the document
        await docRef.delete(); // Delete document from Firestore
        res.status(200).json({ message: 'Novinka byla úspěšně smazána.' });
    } catch (error) {
        console.error('Chyba při mazání novinky:', error);
        res.status(500).json({ error: 'Nepodařilo se smazat novinku.' });
    }
};
