import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter,Routes,Route} from 'react-router-dom';

import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import Room from './Room';
import './style.css';

ReactDOM.createRoot(
  document.getElementById('root')
).render(

  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />}/>
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/room/:roomId" element={<Room />}/>
    </Routes>
  </BrowserRouter>

);
