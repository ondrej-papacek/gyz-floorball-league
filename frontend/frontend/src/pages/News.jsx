import React, { useState, useEffect, useRef } from 'react';
import '../pages/news.css';
import { fetchNews, addNews, updateNews, deleteNews } from '../services/newsService';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { auth } from '../services/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

function News() {
    const [newsData, setNewsData] = useState([]);
    const [expandedNews, setExpandedNews] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const contentRefs = useRef({});

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserRole(userDoc.data().role);
                    } else {
                        alert('Vaše role nebyla nalezena. Kontaktujte administrátora.');
                    }
                }
            } catch (error) {
                alert('Nepodařilo se načíst informace o roli.');
            }
        };

        fetchUserRole();
    }, []);

    useEffect(() => {
        const loadNews = async () => {
            const news = await fetchNews();
            setNewsData(news);
        };
        loadNews();
    }, []);

    const toggleNews = (id) => {
        setExpandedNews(expandedNews === id ? null : id);
    };

    const openLightbox = (image) => {
        setLightboxImage(image);
    };

    const closeLightbox = () => {
        setLightboxImage(null);
    };

    const getHeight = (id) => {
        const element = contentRefs.current[id];
        return element ? `${element.scrollHeight}px` : "0px";
    };

    const handleAddNews = async () => {
        const title = prompt('Zadejte název novinky:');
        if (!title) return alert('Musíte zadat název.');

        const shortDescription = prompt('Zadejte krátký popis:');
        if (!shortDescription) return alert('Musíte zadat krátký popis.');

        const longDescription = prompt('Zadejte dlouhý popis:');
        if (!longDescription) return alert('Musíte zadat dlouhý popis.');

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.click();

        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            if (!file) return alert('Musíte vybrat obrázek.');

            try {
                const imageUrl = await uploadImageToCloudinary(file);
                const newArticle = {
                    title,
                    shortDescription,
                    longDescription,
                    image: imageUrl,
                    date: new Date().toISOString(),
                };

                const addedArticle = await addNews(newArticle);
                setNewsData([addedArticle, ...newsData]);
            } catch {
                alert('Nepodařilo se přidat novinku.');
            }
        };
    };

    const handleEditNews = async (id) => {
        const article = newsData.find((news) => news.id === id);
        if (!article) return;

        const title = prompt('Upravte název novinky:', article.title);
        const shortDescription = prompt('Upravte krátký popis:', article.shortDescription);
        const longDescription = prompt('Upravte dlouhý popis:', article.longDescription);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.click();

        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            let imageUrl = article.image;

            if (file) {
                try {
                    imageUrl = await uploadImageToCloudinary(file);
                } catch {
                    alert('Nepodařilo se nahrát nový obrázek.');
                }
            }

            const updatedArticle = {
                ...article,
                title,
                shortDescription,
                longDescription,
                image: imageUrl,
            };

            await updateNews(id, updatedArticle);
            setNewsData(newsData.map((n) => (n.id === id ? updatedArticle : n)));
        };
    };

    const handleDeleteNews = async (id) => {
        if (window.confirm('Opravdu chcete smazat tuto novinku?')) {
            await deleteNews(id);
            setNewsData(newsData.filter((news) => news.id !== id));
        }
    };

    return (
        <div className="news-page">
            <h2 className="news-title">Novinky</h2>
            {newsData.map((news) => {
                const formattedDate = new Date(news.date).toLocaleDateString('cs-CZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                return (
                    <div key={news.id} className="news-item">
                        <div className="news-content">
                            <h2>{news.title}</h2>
                            <p className="news-date">{formattedDate}</p>
                            <div
                                ref={(el) => (contentRefs.current[news.id] = el)}
                                className={`news-description ${expandedNews === news.id ? 'expanded' : ''}`}
                                style={{
                                    maxHeight: expandedNews === news.id ? getHeight(news.id) : '0px',
                                    transition: 'max-height 0.5s ease',
                                    overflow: 'hidden',
                                }}
                            >
                                {news.longDescription}
                            </div>
                            <button onClick={() => toggleNews(news.id)} className="news-toggle-button">
                                {expandedNews === news.id ? 'Číst méně' : 'Číst více'}
                            </button>
                        </div>
                        <div className="news-image-container">
                            <img
                                src={news.image}
                                alt={news.title}
                                className="news-image"
                                onClick={() => openLightbox(news.image)}
                            />
                            <p className="news-image-caption">{news.title}</p>
                        </div>
                        {userRole === 'admin' && (
                            <div className="admin-controls">
                                <button onClick={() => handleEditNews(news.id)}>Upravit</button>
                                <button onClick={() => handleDeleteNews(news.id)}>Smazat</button>
                            </div>
                        )}
                    </div>
                );
            })}

            {userRole === 'admin' && <button onClick={handleAddNews}>Přidat novinku</button>}

            {lightboxImage && (
                <div className="lightbox" onClick={closeLightbox}>
                    <img src={lightboxImage} alt="Expanded view" className="lightbox-image" />
                </div>
            )}
        </div>
    );
}

export default News;
