import React, { useState, useEffect } from 'react';
import './NewsSection.css';

function NewsSection() {
    const [news, setNews] = useState([]);

    // Fetch latest news from backend
    useEffect(() => {
        fetch('http://localhost:5000/api/news')  // Update this URL with your backend's news endpoint
            .then((response) => response.json())
            .then((data) => {
                // Assuming your backend returns an array of news articles
                setNews(data.slice(0, 3)); // Get only the latest 3 news
            })
            .catch((error) => console.error('Error fetching news:', error));
    }, []);

    return (
        <section className="news-section">
            <h2>Latest News</h2>
            {news.length === 0 ? (
                <p>No news available</p>
            ) : (
                <ul className="news-list">
                    {news.map((article, index) => (
                        <li key={index} className="news-item">
                            <h3>{article.title}</h3>
                            <p>{article.content}</p>
                            <small>{new Date(article.date).toLocaleDateString()}</small>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default NewsSection;
