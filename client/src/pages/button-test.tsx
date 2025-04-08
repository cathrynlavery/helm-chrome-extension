import React from 'react';

const ButtonTest = () => {
  const handleClick = () => {
    console.log('BUTTON CLICKED');
    alert('Button was clicked!');
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '20px', color: 'red', fontSize: '24px' }}>
        Button Test Page
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <button
          onClick={handleClick}
          style={{
            background: 'blue',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          Pure HTML Button - Click Me
        </button>
        
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            console.log('LINK CLICKED');
            alert('Link was clicked!');
          }}
          style={{
            color: 'purple',
            textDecoration: 'underline',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          This is a test link - Click Me
        </a>
        
        <div
          onClick={handleClick}
          style={{
            background: 'green',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            userSelect: 'none',
            fontSize: '18px'
          }}
        >
          This is a div with onClick - Click Me
        </div>
      </div>
    </div>
  );
};

export default ButtonTest;