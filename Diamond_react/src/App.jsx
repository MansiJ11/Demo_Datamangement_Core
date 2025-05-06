import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import DimandForm from './pages/DimandForm';
import AddClient from './pages/AddClient';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/DimandForm" element={<DimandForm />} />
          <Route path="/Addclient" element={<AddClient />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
