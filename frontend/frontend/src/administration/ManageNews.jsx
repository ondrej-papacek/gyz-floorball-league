import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import './manageNews.css';

const ManageNews = () => {
    const [news, setNews] = useState([]);
    const [newArticle, setNewArticle] = useState({
        title: '',
        shortDescription: '',
        longDescription: '',
        image: ''
    });
    const [editingArticle, setEditingArticle] = useState(null);

    // Fetch all news articles
    useEffect(() => {
        const fetchNews = async () => {
            const newsRef = collection(db, 'news');
            const snapshot = await getDocs(newsRef);
            const newsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNews(newsData);
        };

        fetchNews();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewArticle(prev => ({ ...prev, [name]: value }));
    };

    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = await uploadImageToCloudinary(file);
            setNewArticle(prev => ({ ...prev, image: imageUrl }));
        }
    };

    // Add new article
    const handleAddNews = async () => {
        if (!newArticle.title || !newArticle.shortDescription || !newArticle.longDescription || !newArticle.image) {
            alert("Vyplňte všechna pole a nahrajte obrázek.");
            return;
        }

        const newsRef = collection(db, 'news');
        const docRef = await addDoc(newsRef, {
            ...newArticle,
            date: new Date().toISOString(),
        });

        setNews([{ id: docRef.id, ...newArticle, date: new Date().toISOString() }, ...news]);
        setNewArticle({ title: '', shortDescription: '', longDescription: '', image: '' });
        alert("Novinka byla přidána.");
    };

    // Edit news article
    const handleEditNews = async () => {
        if (!editingArticle) return;

        const newsRef = doc(db, 'news', editingArticle.id);
        await updateDoc(newsRef, editingArticle);

        setNews(news.map(n => (n.id === editingArticle.id ? editingArticle : n)));
        setEditingArticle(null);
        alert("Novinka byla aktualizována.");
    };

    // Delete news article
    const handleDeleteNews = async (id) => {
        if (window.confirm("Opravdu chcete tuto novinku smazat?")) {
            const newsRef = doc(db, 'news', id);
            await deleteDoc(newsRef);
            setNews(news.filter(n => n.id !== id));
            alert("Novinka byla smazána.");
        }
    };

    return (
        <div className="manage-news-page">
            <h1>Správa Novinek</h1>

            {/* ADD NEWS FORM */}
            <div className="news-form">
                <h2>Přidat novinku</h2>
                <input
                    type="text"
                    name="title"
                    placeholder="Nadpis"
                    value={newArticle.title}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="shortDescription"
                    placeholder="Krátký popis"
                    value={newArticle.shortDescription}
                    onChange={handleInputChange}
                />
                <textarea
                    name="longDescription"
                    placeholder="Dlouhý popis"
                    value={newArticle.longDescription}
                    onChange={handleInputChange}
                />
                <input type="file" onChange={handleImageUpload} />
                {newArticle.image && <img src={newArticle.image} alt="Preview" className="news-preview-image" />}
                <button onClick={handleAddNews}>Přidat Novinku</button>
            </div>

            {/* EDITING FORM */}
            {editingArticle && (
                <div className="news-form">
                    <h2>Upravit novinku</h2>
                    <input
                        type="text"
                        value={editingArticle.title}
                        onChange={(e) => setEditingArticle(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <input
                        type="text"
                        value={editingArticle.shortDescription}
                        onChange={(e) => setEditingArticle(prev => ({ ...prev, shortDescription: e.target.value }))}
                    />
                    <textarea
                        value={editingArticle.longDescription}
                        onChange={(e) => setEditingArticle(prev => ({ ...prev, longDescription: e.target.value }))}
                    />
                    <button onClick={handleEditNews}>Uložit změny</button>
                    <button onClick={() => setEditingArticle(null)}>Zrušit</button>
                </div>
            )}

            {/* NEWS LIST */}
            <div className="news-list">
                <h2>Seznam novinek</h2>
                {news.map(article => (
                    <div key={article.id} className="news-item">
                        <img src={article.image} alt={article.title} className="news-item-image" />
                        <div className="news-content">
                            <h3>{article.title}</h3>
                            <p>{article.shortDescription}</p>
                            <button onClick={() => setEditingArticle(article)}>Upravit</button>
                            <button onClick={() => handleDeleteNews(article.id)}>Smazat</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageNews;
