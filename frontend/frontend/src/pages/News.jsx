import React, { useState, useRef } from 'react';
import '../pages/news.css';

export const newsData = [
    {
        id: 1,
        title: "Úspěch na turnaji ve florbalu",
        date: "2024-10-08",
        shortDescription: "Náš školní tým zvítězil v okresním turnaji ve florbalu!",
        longDescription: "Náš školní florbalový tým zvítězil na okresním turnaji, který se konal 10.8.2024. Hráči prokázali úžasnou týmovou spolupráci a sportovního ducha. Gratulujeme všem, kteří se podíleli! Tento úspěch je velkým milníkem pro náš tým a jsme na hráče nesmírně pyšní. Sledujte nás pro informace o nadcházejícím regionálním turnaji, kde doufáme v další vítězství!",
        image: "/images/hero-img3.png"
    },
    {
        id: 2,
        title: "Nové tréninky ve florbalu",
        date: "2024-08-15",
        shortDescription: "Byly oznámeny nové tréninky pro mladší hráče.",
        longDescription: "Od 15.8.2024 zahajujeme nové tréninkové lekce určené pro mladší hráče (8-12 let). Tyto lekce jsou zaměřeny na rozvoj základních dovedností a představení mladým hráčům radosti z florbalu. Každý trénink je veden zkušenými trenéry, kteří dbají na rozvoj dovedností a zároveň na zábavu. Pokud máte zájem, kontaktujte nás pro zajištění místa!",
        image: "/images/hero-img2.png"
    },
    {
        id: 3,
        title: "Seznamte se s naším novým trenérem",
        date: "2024-08-20",
        shortDescription: "Představujeme našeho nového trenéra, bývalého reprezentanta!",
        longDescription: "S radostí vítáme našeho nového trenéra, bývalého reprezentanta s více než desetiletými zkušenostmi. Trenér Alex se k nám připojil 20.8.2024 a přináší s sebou bohaté znalosti a nadšení pro tým. Jeho vedení a zkušenosti očekáváme, že pozvednou náš tým na novou úroveň. Těšíme se na jeho přínos pro hráče a celý školní florbalový program.",
        image: "/images/hero-img.jpg"
    }
];

function News() {
    const [expandedNews, setExpandedNews] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);
    const contentRefs = useRef({});

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
                                    maxHeight: expandedNews === news.id ? getHeight(news.id) : "0px",
                                    transition: "max-height 0.5s ease",
                                    overflow: "hidden",
                                }}
                            >
                                {news.longDescription}
                            </div>
                            <button
                                onClick={() => toggleNews(news.id)}
                                className="news-toggle-button"
                            >
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
                    <img src={lightboxImage} alt="Expanded view" className="lightbox-image"/>
                </div>
            )}
        </div>
    );
}

export default News;