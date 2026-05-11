<template>
  <div class="about-view">
    <div class="about-card">
      <div class="image-container">
        <img 
          src="C:\Users\jevus\Downloads\MyFlow\Snapchat-1443653098.jpg"
          alt="Equipo Corralón"
        >
        <div class="overlay"></div>
        <h1>Los Inexpertos</h1>
      </div>

      <div class="content">
        <h2>Sobre Nosotros</h2>
        <p>
          Bienvenido a <strong>Corralink</strong>. No sabemos lo que hacemos, este es nuestro proyecto funcional.
        </p>
        <p>
          Hola.
        </p>
        <p class="slogan">"Seguridad, Orden y Confianza."</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  height: 100%;
}

.about-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  width: 100%;
  animation: slideUp 0.6s ease-out;
}

.image-container {
  position: relative;
  width: 100%;
  height: auto;
  background-color: #000;
  display: block;
}

.image-container img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%);
}

.image-container h1 {
  position: absolute;
  bottom: 20px;
  left: 30px;
  color: white;
  margin: 0;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.content {
  padding: 30px;
  color: #333;
}

.content h2 {
  color: #2c3e50;
  margin-top: 0;
  border-bottom: 2px solid #3498db;
  display: inline-block;
  padding-bottom: 5px;
}

.content p {
  line-height: 1.2;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.slogan {
  text-align: center;
  font-style: italic;
  font-weight: bold;
  color: #7f8c8d;
  margin-top: 2rem;
  font-size: 1.3rem;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>