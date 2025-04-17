
'use client';
import React from 'react';

export default function Home() {
  return (
    <main className="bg-white min-h-screen">
      {/* NAVBAR */}
      <header className="fixed w-full bg-white shadow z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-700">EditorAI</div>
          <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <a href="#" className="hover:text-blue-600">Início</a>
            <a href="#como-funciona" className="hover:text-blue-600">Como Funciona</a>
            <a href="#planos" className="hover:text-blue-600">Planos</a>
            <a href="#login" className="hover:text-blue-600">Login</a>
            <a href="#" className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Começar Agora</a>
          </nav>
          <div className="md:hidden">
            <i className="fas fa-bars text-2xl"></i>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 to-white px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-blue-800">
              Edite Sites com a Força da <span className="text-blue-600">Inteligência Artificial</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Carregue seu HTML, descreva a alteração e veja a mágica acontecer com IA.
            </p>
            <a href="/editor" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg text-lg shadow">
  <i className="fas fa-magic mr-2"></i> Editar com IA
</a>
         </div>
          <div className="md:w-1/2 flex justify-center">
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712100.png" alt="IA editando site" className="w-full max-w-md" />
          </div>
        </div>
      </section>
    </main>
  );
}
