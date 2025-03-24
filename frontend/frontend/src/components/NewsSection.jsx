import React, { useState, useEffect } from 'react';
import './NewsSection.css';
import { fetchLatestNews } from '../services/newsService';
import { Link } from 'react-router-dom';

function NewsSection() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const latestNews = await fetchLatestNews();
                setNews(latestNews);
            } catch (error) {
                console.error("Error loading latest news:", error);
            }
        })();
    }, []);

    return (
        <section className="news-section">
            <h2>Aktuální novinky</h2>
            {news.length === 0 ? (
                <p>Nejsou dostupné žádné nové novinky</p>
            ) : (
                <ul className="news-list">
                    {news.map((article) => {
                        const formattedDate = article.date
                            ? new Date(article.date).toLocaleDateString('cs-CZ', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })
                            : 'Neznámé datum';

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
