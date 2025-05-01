import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import DimandForm from './pages/DimandForm';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/DimandForm" element={<DimandForm />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
