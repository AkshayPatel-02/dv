import React from 'react';
import { Link } from 'react-router-dom';

const Ollaverse = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">OLLAVERSE</h1>
        <p className="text-lg text-muted-foreground mb-6">September 29–30, 2026 • Nalanda Auditorium, VBIT</p>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
          Explore Ollama and build AI-powered projects in this 2-day event.
        </p>

        <Link to="/ollaverse/registration" aria-label="Register for Ollaverse" className="inline-block">
          <button className="btn-academic px-6 py-3 text-base">Register Now</button>
        </Link>
      </div>
    </div>
  );
};

export default Ollaverse;