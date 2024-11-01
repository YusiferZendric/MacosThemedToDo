import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import TodoList from './components/Todo/TodoList';
import Register from './components/Auth/Register';
import HistoryTab from './components/History/HistoryTab';
import Header from './components/Header';
import PrivateRoute from './components/Auth/PrivateRoute';
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-bg text-white">
        <div className="fixed inset-0  pointer-events-none" />
          {/* <div className="noise fixed inset-0 opacity-[0.03] pointer-events-none" /> Reduced noise opacity */}
          <div className="relative z-10">
            <Header />
            <div className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <PrivateRoute>
                    <TodoList />
                  </PrivateRoute>
                } />
                <Route path="/history" element={
                  <PrivateRoute>
                    <HistoryTab />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;