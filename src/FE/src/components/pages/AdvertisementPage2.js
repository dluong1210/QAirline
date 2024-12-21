import React from 'react';
import './AdvertisementPage2.css';

const AdvertisementPage2 = () => {
  return (
    <div className="advertisement-page">
      <div className="content">
        {/* Header Section */}
        <div className="header">
          <h1 className="title" style={{ color: 'red', fontSize: '3rem', textAlign: 'center', marginBottom: "20px" }}>
            Pre-order hot, fresh meals now and get a 40% discount
          </h1>
        </div>

        {/* Content Section */}
        <div className="content">
          <p>
            Welcome the exciting month of December with a special discount on hot meals, letting you explore global cuisine at 10,000 meters altitude:
          </p>
          <h2>Promotion details:</h2>
          <p>
            Passengers pre-ordering hot meals can enjoy a 40% discount on all QAirline-operated flights.
          </p>

          <h2>Scope of application:</h2>
          <ul>
            <li>Website: <a href="http://www.example.com">www.example.com</a></li>
            <li>QAirline app on Google Play &amp; App Store</li>
            <li>OTA</li>
            <li>QAirline agents</li>
            <li>Customer Service Center 19001886</li>
            <li>QAirline ticket offices</li>
          </ul>

          <h2>Duration of application:</h2>
          <p>
            Applies to pre-ordered meals successfully booked and paid for from 00:00 on December 10, 2024, to 23:59 on December 31, 2024, with no flight time restrictions.
          </p>

          <h2>Terms and Conditions:</h2>
          <ul>
            <li>Pre-ordered meals cannot be refunded or canceled.</li>
            <li>
              Passengers can change pre-paid meals by contacting the Customer Service Center 19001886 for support.
            </li>
          </ul>
        </div>

        {/* Related News Section */}
        <div className="related-news">
          <h3>Related News</h3>
          <div className="news-sliderr">
            <div className="news-item">
              <img src="https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/accsca-1732595502516.jpg" alt="Travel the world and rediscover yourself" />
              <h4>Travel the world and rediscover yourself</h4>
            </div>
            <div className="news-item">
              <img src="https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/bannertrangfare1920x450kv10namtwvn-1732781611862.jpg" alt="Free 20kg checked baggage" />
              <h4>Free 20kg checked baggage - Celebrating 10 years in Taiwan</h4>
            </div>
            <div className="news-item">
              <img src="https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/accsca-1732595502516.jpg" alt="Travel the world and rediscover yourself" />
              <h4>Travel the world and rediscover yourself</h4>
            </div>
            <div className="news-item">
              <img src="https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/bannertrangfare1920x450kv10namtwvn-1732781611862.jpg" alt="Free 20kg checked baggage" />
              <h4>Free 20kg checked baggage - Celebrating 10 years in Taiwan</h4>
            </div>
            
            {/* Add more news items as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementPage2;
