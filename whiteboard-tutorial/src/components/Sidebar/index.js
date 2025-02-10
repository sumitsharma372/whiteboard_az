import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './index.min.css';
import { useNavigate } from 'react-router-dom';
import boardContext from '../../store/board-context';
import { useParams } from 'react-router-dom';


const Sidebar = () => {
  const [canvases, setCanvases] = useState([]);
  const token = localStorage.getItem('whiteboard_user_token');
  const { canvasId, setCanvasId,setElements,setHistory, isUserLoggedIn, setUserLoginStatus} = useContext(boardContext);
  const navigate = useNavigate();

  const { id } = useParams(); 

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchCanvases();
    }
  }, [isUserLoggedIn]);

  useEffect(() => {}, []);


  const fetchCanvases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/canvas/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanvases(response.data);
      console.log(response.data)
      
      if (response.data.length === 0) {
        const newCanvas = await handleCreateCanvas();
        if (newCanvas) {
          setCanvasId(newCanvas._id);
          handleCanvasClick(newCanvas._id);
        }
      } else if (!canvasId && response.data.length > 0) {
        if(!id){
          setCanvasId(response.data[0]._id);
          handleCanvasClick(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching canvases:', error);
    }
  };

  const handleCreateCanvas = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/canvas/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data)  
      fetchCanvases();
      setCanvasId(response.data.canvasId);
      handleCanvasClick(response.data.canvasId);
    } catch (error) {
      console.error('Error creating canvas:', error);
      return null;
    }
  };

  const handleDeleteCanvas = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/canvas/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCanvases();
      setCanvasId(canvases[0]._id);
      handleCanvasClick(canvases[0]._id);
    } catch (error) {
      console.error('Error deleting canvas:', error);
    }
  };

  const handleCanvasClick = async (id) => {
    navigate(`/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('whiteboard_user_token');
    setCanvases([]);
    setUserLoginStatus(false);
    window.location.reload();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <button 
        className="create-button" 
        onClick={handleCreateCanvas} 
        disabled={!isUserLoggedIn}
      >
        + Create New Canvas
      </button>
      <ul className="canvas-list">
        {canvases.map(canvas => (
          <li 
            key={canvas._id} 
            className={`canvas-item ${canvas._id === canvasId ? 'selected' : ''}`}
          >
            <span 
              className="canvas-name" 
              onClick={() => handleCanvasClick(canvas._id)}
            >
              {canvas._id}
            </span>
            <button className="delete-button" onClick={() => handleDeleteCanvas(canvas._id)}>
              del
            </button>
          </li>
        ))}
      </ul>
      {isUserLoggedIn ? (
        <button className="auth-button logout-button" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button className="auth-button login-button" onClick={handleLogin}>
          Login
        </button>
      )}
    </div>
  );
};

export default Sidebar;
