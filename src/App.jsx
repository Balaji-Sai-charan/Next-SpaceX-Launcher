import React, { useState, useEffect } from 'react';
import './App.css';

const LaunchTracker = () => {
  const [launchData, setLaunchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [rocketName, setRocketName] = useState('');
  const [launchpadName, setLaunchpadName] = useState('');

  // Fetch rocket and launchpad details
  const fetchRocketAndPad = async (rocketId, padId) => {
    try {
      const [rocketRes, padRes] = await Promise.all([
        fetch(`https://api.spacexdata.com/v4/rockets/${rocketId}`),
        fetch(`https://api.spacexdata.com/v4/launchpads/${padId}`)
      ]);
      const rocket = await rocketRes.json();
      const pad = await padRes.json();
      setRocketName(rocket.name);
      setLaunchpadName(pad.name);
    } catch {
      setRocketName('Unknown');
      setLaunchpadName('Unknown');
    }
  };

  const fetchLaunchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.spacexdata.com/v4/launches/next');
      if (!response.ok) throw new Error('Network response error');
      const data = await response.json();
      setLaunchData(data);
      setCountdown(new Date(data.date_utc) - new Date());
      fetchRocketAndPad(data.rocket, data.launchpad);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaunchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (launchData) {
        setCountdown(new Date(launchData.date_utc) - new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [launchData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return 'Launched!';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handleRefresh = () => {
    fetchLaunchData();
  };

  if (loading) return <div className="lt-loading">Loading...</div>;
  if (error) return <div className="lt-error">Error: {error}</div>;

  return (
    <div className="lt-container">
      <h1 className="lt-title">🚀 Next SpaceX Launch</h1>
      <div className="lt-card">
        <h2 className="lt-mission">{launchData.name}</h2>
        <div className="lt-info-row"><span>Launch Date:</span> <strong>{formatDate(launchData.date_utc)}</strong></div>
        <div className="lt-info-row"><span>Rocket:</span> <strong>{rocketName}</strong></div>
        <div className="lt-info-row"><span>Launch Site:</span> <strong>{launchpadName}</strong></div>
        <div className="lt-countdown">
          <span>Countdown:</span> <span className="lt-countdown-value">{formatCountdown(countdown)}</span>
        </div>
        <button className="lt-refresh-btn" onClick={handleRefresh}>🔄 Refresh</button>
      </div>
      {launchData.details && <div className="lt-details">{launchData.details}</div>}
      {launchData.links && launchData.links.webcast && (
        <a className="lt-webcast" href={launchData.links.webcast} target="_blank" rel="noopener noreferrer">Watch Webcast</a>
      )}
    </div>
  );
};

export default LaunchTracker;
