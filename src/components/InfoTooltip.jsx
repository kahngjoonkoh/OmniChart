import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block', marginLeft: 5 }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span style={{ cursor: 'pointer', fontWeight: 'bold' }}><FontAwesomeIcon icon={faCircleInfo} style={{ cursor: 'pointer' }} /></span>
      {visible && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid #ccc',
            padding: '10px',
            width: 240,
            zIndex: 100,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            fontSize: '0.9rem',
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default InfoTooltip;