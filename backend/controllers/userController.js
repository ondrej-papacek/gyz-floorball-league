const admin = require('../firebase');
const db = admin.firestore();

exports.getUsers = async (req, res, next) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(users);
    } catch (error) {
        next(new Error('Nepodařilo se načíst uživatele.'));
    }
};

exports.addUser = async (req, res, next) => {
    try {
        const { uid, role } = req.body;
        const newUser = { uid, role };
        const userRef = await db.collection('users').add(newUser);
        res.status(201).json({ id: userRef.id, ...newUser });
    } catch (error) {
        next(new Error('Nepodařilo se vytvořit uživatele.'));
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;
        await db.collection('users').doc(userId).update({ role });
        res.status(200).json({ message: 'Role uživatele byla úspěšně aktualizována.' });
    } catch (error) {
        next(new Error('Nepodařilo se aktualizovat roli uživatele.'));
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        await db.collection('users').doc(userId).delete();
        await admin.auth().deleteUser(userId);

        res.status(200).json({ message: 'Uživatel byl úspěšně smazán.' });
    } catch (error) {
        next(new Error('Nepodařilo se smazat uživatele.'));
    }
};

