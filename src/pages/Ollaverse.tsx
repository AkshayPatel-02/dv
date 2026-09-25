const Ollaverse = () => {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>OLLAVERSE</h1>
      <h2>September 29–30, 2026</h2>
      <p>Nalanda Auditorium, VBIT</p>

      <p>
        Explore Ollama and build AI-powered projects in this 2-day event.
      </p>

      <button
        onClick={() => window.open("/ollaverse-registration", "_blank")}
      >
        Register Now
      </button>
    </div>
  );
};

export default Ollaverse;