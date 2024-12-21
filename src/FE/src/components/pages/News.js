import React, { useState, useEffect } from "react";
import "./News.css";
import { useAdvert } from "hooks/advert/useAdvert";

const mocksNewsData = [
  { id: 1, image_url: "img/adv3.jpg" },
  { id: 2, image_url: "img/adv3.jpg" },
  { id: 3, image_url: "img/adv3.jpg" }
];

const News = () => {
  const {getAllAdvert} = useAdvert();
  const [newsData, setNewsData] = useState([]);

  useEffect(() => {
    getAllAdvert().then(data => {
      setNewsData(mocksNewsData.map(ad => ({
        id: ad.idAdvertisement,
        image: ad.image_url,
      })));
    })
  }, [])


  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === newsData.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [newsData.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="news-page">
      <div className="news-header">
        <div className="ticker">
          <span>WELCOME TO NEWS PAGE - UPDATE INFORMATION CONSTANTLY! WE HOPE ALL YOU GUYS CAN ENJOY OUR BEST SERVICES.</span>
        </div>
        <div className="live-clock">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      <div className="news-carousel">
        <div
          className="news-slider"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {newsData.map((news) => (
            <a className="news-slide" key={news.id} href="/adv2">
              <img src={news.image} alt={news.title} className="news-image" />
              <div className="news-content">
                <h2>{news.title}</h2>
                <p>{news.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Dấu chấm chuyển trang */}
      <div className="dots-news">
        {newsData.map((_, index) => (
          <span
            key={index}
            className={`dot-news ${currentIndex === index ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default News;