import React, { useEffect, useRef } from 'react';
import './WidgetCSS.css';

const MISSION_NUMBERS = {
  mercury: '001',
  venus: '002',
  earth: '003',
  mars: '004',
  jupiter: '005',
  saturn: '006',
  uranus: '007',
  neptune: '008'
};

const Widget = ({ isVisible, planetName, onClose, info, place, gamedescription }) => {
  const widgetRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  const localInfo = info || ''; // in case info is not passed
  const localPlace = place || ''; // in case place is not passed
  const localGameDescription = gamedescription || ''; // in case gamedescription is not passed
  const missionNumber = planetName ? MISSION_NUMBERS[planetName.toLowerCase()] : '';

  return (
    <div
      ref={widgetRef}
      className={`widget-container ${isVisible ? 'visible' : ''}`}
    >
      <h2 className='title'>
        Mission {missionNumber}
      </h2>

      <h3 style={{ fontSize: '1.32em' }}>
        <div style={{ fontWeight: '400', marginBottom: '0.5rem', marginLeft: '0.5rem', marginRight: '1rem' }}><span style={{ fontWeight: '600' }}>Planet-name: </span>{planetName}.</div>
        <div style={{ fontWeight: '400', marginBottom: '0.5rem', marginLeft: '0.5rem', marginRight: '1rem' }}><span style={{ fontWeight: '600' }}>Current-info: </span>{localInfo}</div>
        <div style={{ fontWeight: '400', marginBottom: '0.5rem', marginLeft: '0.5rem', marginRight: '1rem' }}><span style={{ fontWeight: '600' }}>Mission: </span>{localGameDescription}</div>
      </h3>

      <hr style={{ marginTop: '2rem', marginBottom: '2rem', borderColor: 'black', width: '75%' }} />

      <button 
        onClick={() => {
          window.location.href = localPlace;
        }}
        className='play-button'
        >
        Initiate expedition
      </button>
    </div>
  );
};

export default Widget;
