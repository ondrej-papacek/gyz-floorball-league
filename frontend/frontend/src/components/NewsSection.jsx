import React, { useState, useEffect } from 'react';
import './NewsSection.css';
import { fetchNews } from '../services/newsService'; // Backend service
import { Link } from 'react-router-dom';

function NewsSection() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        const loadLatestNews = async () => {
            const allNews = await fetchNews(); // Fetch all news
            setNews(allNews.slice(0, 3)); // Take the latest 3
        };

        loadLatestNews();
    }, []);

    return (
        <section className="news-section">
            <h2>Aktuální novinky</h2>
            {news.length === 0 ? (
                <p>Nejsou dostupné žádné nové novinky</p>
            ) : (
                <ul className="news-list">
                    {news.map((article) => {
                        const formattedDate = new Date(article.date).toLocaleDateString('cs-CZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });

                        return (
                            <li key={article.id} className="news-section-item">
                                <Link to={`/news/${article.id}`} className="news-link">
                                    <h3>{article.title}</h3>
                                    <p>{article.shortDescription}</p>
                                    <small>{formattedDate}</small>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

export default NewsSection;
