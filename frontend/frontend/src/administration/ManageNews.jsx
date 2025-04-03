import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { db } from '../services/firebase';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import './manageNews.css';

const ManageNews = () => {
    const [news, setNews] = useState([]);
    const [form, setForm] = useState({
        title: '',
        shortDescription: '',
        longDescription: '',
        image: '',
        date: new Date()
    });
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            const newsRef = collection(db, 'news');
            const snapshot = await getDocs(newsRef);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNews(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        };
        fetchNews();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setForm(prev => ({ ...prev, date }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await uploadImageToCloudinary(file);
            setForm(prev => ({ ...prev, image: url }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setForm({
            title: '',
            shortDescription: '',
            longDescription: '',
            image: '',
            date: new Date()
        });
        setEditingId(null);
        setImagePreview('');
    };

    const handleSubmit = async () => {
        const payload = {
            ...form,
            date: new Date(form.date).toISOString()
        };

        if (editingId) {
            await updateDoc(doc(db, 'news', editingId), payload);
            setNews(prev => prev.map(n => n.id === editingId ? { id: editingId, ...payload } : n));
        } else {
            const docRef = await addDoc(collection(db, 'news'), payload);
            setNews(prev => [{ id: docRef.id, ...payload }, ...prev]);
        }

        resetForm();
        alert(editingId ? "Novinka upravena." : "Novinka přidána.");
    };

    const handleEdit = (article) => {
        setEditingId(article.id);
        setForm({
            ...article,
            date: article.date ? new Date(article.date) : new Date()
        });
        setImagePreview(article.image);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Opravdu chcete smazat tuto novinku?")) return;
        await deleteDoc(doc(db, 'news', id));
        setNews(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="manage-news-page">
            <h1>Správa Novinek</h1>

            <div className="news-form">
                <input
                    name="title"
                    placeholder="Nadpis"
                    value={form.title}
                    onChange={handleChange}
                />
                <DatePicker
                    selected={form.date}
                    onChange={handleDateChange}
                    dateFormat="dd. MMMM yyyy"
                    className="datepicker"
                />
                <input
                    name="shortDescription"
                    placeholder="Krátký popis"
                    value={form.shortDescription}
                    onChange={handleChange}
                />
                <textarea
                    name="longDescription"
                    placeholder="Dlouhý popis"
                    value={form.longDescription}
                    onChange={handleChange}
                />
                <input type="file" onChange={handleImageUpload} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="news-preview-image" />}
                <button onClick={handleSubmit}>
                    {editingId ? 'Uložit změny' : 'Přidat Novinku'}
                </button>
                {editingId && <button onClick={resetForm}>Zrušit úpravy</button>}
            </div>

            <div className="news-list">
                {news.map(article => (
                    <div key={article.id} className="news-item">
                        <img src={article.image} alt={article.title} />
                        <div className="news-content">
                            <h3>{article.title}</h3>
                            <p>{article.shortDescription}</p>
                            <button onClick={() => handleEdit(article)}>Upravit</button>
                            <button onClick={() => handleDelete(article.id)}>Smazat</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageNews;
