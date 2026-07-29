import React, { useEffect, useState } from "react";
import "./NotificationBanner.css";

const NotificationBanner = ({ message, showHand }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const hideTimeout = setTimeout(() => setVisible(false), 5000); 
    return () => clearTimeout(hideTimeout); 
  }, []);

  return (
    <div className={`notification-banner ${visible ? "show" : ""}`}>
      <span>
        {message}
        {showHand && <span className="waving-hand"></span>}
      </span>
      <div className="loading-bar"></div>
    </div>
  );
};

export default NotificationBanner;