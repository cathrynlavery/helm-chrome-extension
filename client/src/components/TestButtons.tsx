import React from 'react';
import { Button } from '@/components/ui/button';

const TestButtons = () => {
  const handleButtonClick = (buttonNumber: number) => {
    console.log(`Button ${buttonNumber} clicked!`);
    alert(`Button ${buttonNumber} clicked!`);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 9999,
        padding: '15px',
        background: '#fff',
        border: '2px solid red',
        width: '100%',
        display: 'flex',
        gap: '10px'
      }}
    >
      <h3>Test Buttons:</h3>
      <button 
        onClick={() => handleButtonClick(1)}
        style={{ background: 'blue', color: 'white', padding: '10px' }}
      >
        Pure HTML Button
      </button>

      <Button 
        onClick={() => handleButtonClick(2)}
        className="bg-green-500 hover:bg-green-600"
      >
        Shadcn Button
      </Button>

      <a 
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleButtonClick(3);
        }}
        style={{ color: 'purple', textDecoration: 'underline' }}
      >
        Link Click Test
      </a>
    </div>
  );
};

export default TestButtons;