import React, { useState } from 'react';

export const SWUpdateDialog: React.FC<{ registration: ServiceWorkerRegistration }> = ({ registration }) => {
  const [show, setShow] = useState(!!registration.waiting);
  const style: React.CSSProperties = {
    width: '100%',
    backgroundImage: 'linear-gradient(rgb(255, 255, 255), rgb(255, 250, 222))',
    color: 'black',
    padding: 5,
  };
  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#ff6aac',
    color: '#fff',
    boxShadow: '0 6px 16px rgb(255 106 172 / 50%)',
    fontWeight: 600,
    borderRadius: 3,
    height: 30,
  };

  const handleUpdate = () => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    setShow(false);
    window.location.reload();
  };

  return show ? (
    <div style={style}>
      <span style={{ marginRight: 15 }}>アプリに更新があります</span>
      <button style={buttonStyle} onClick={handleUpdate}>
        アップデート
      </button>
    </div>
  ) : (
    <></>
  );
};
