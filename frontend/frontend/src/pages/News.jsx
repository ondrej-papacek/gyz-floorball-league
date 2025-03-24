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
    const contentRefs = useRef({});

    useEffect(() => {
        (async () => {
            try {
                const news = await fetchNews();
                setNewsData(news);
            } catch (error) {
                console.error("Error loading news:", error);
            }
        })();
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

    return (
        <div className="news-page">
            <h2 className="news-title">Novinky</h2>
            {newsData.map((news) => {
                const formattedDate = news.date
                    ? new Date(news.date).toLocaleDateString('cs-CZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })
                    : 'Neznámé datum';

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
                    </div>
                );
            })}

            {lightboxImage && (
                <div className="lightbox" onClick={closeLightbox}>
                    <img src={lightboxImage} alt="Expanded view" className="lightbox-image" />
                </div>
            )}
        </div>
    );
}

export default News;
