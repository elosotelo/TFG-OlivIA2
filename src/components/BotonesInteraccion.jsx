import React from "react";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";

export default function BotonesInteraccion({
  prompt,
  setPrompt,
  showHelpOptions,
  showSimplificationOptions,
  showTextInput,
  unknownWords,
  setUnknownWords,
  requestExample,
  requestSummary,
  requestSimplifiedResponse,
  requestSynonyms,
  toggleSynonymInput,
  handleSimplification,
  closeRedButtonOptions,
  setShowHelpOptions,
  setShowUsefulQuestion,
  showUsefulQuestion,
  showConfirmationButton,
  setShowConfirmationButton,
  saveChatToHistory,
  sendPrompt, // 👈 usamos sendPrompt en lugar de sendCustomPrompt
  ambiguousStep,
  selectedOption,
  setSelectedOption, // 👈 necesario para resetear opción
}) {
  const startListeningLocal = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
    };

    recognition.start();
  };

  const handleSendPromptDesdeCero = () => {
    if (!prompt.trim()) return;
    setSelectedOption(null); // ✅ Limpia opción previa
    sendPrompt(prompt, null); // ✅ Llama correctamente
    setPrompt(""); // ✅ Limpia el input
  };

  return (
    <>
      {/* ❌ Ocultar TODO durante aclaración ambigua */}
      {ambiguousStep !== 1 && showHelpOptions && (
        <>
          <div className="chat-container">
            <div className="robot-bubble">
              <img src={robotLogo} alt="OlivIA" className="robot-icon" />
              <p>¿Quieres que te ayude a entenderlo mejor?</p>
            </div>
          </div>

          <div className="chat-container">
            <div className="help-buttons">
              <button
                className="help-btn blue"
                onClick={() => {
                  closeRedButtonOptions();
                  requestExample();
                }}
              >
                Explícame con un ejemplo
              </button>
              <button
                className="help-btn green"
                onClick={() => {
                  closeRedButtonOptions();
                  requestSummary();
                }}
              >
                Dame un resumen
              </button>
              <button className="help-btn red" onClick={handleSimplification}>
                Responder en lenguaje más sencillo
              </button>
              <button
                className="help-btn gray"
                onClick={() => {
                  closeRedButtonOptions();
                  setShowHelpOptions(false);
                  setShowUsefulQuestion(true);
                  setShowConfirmationButton(false);
                }}
              >
                No, gracias
              </button>
            </div>
          </div>
        </>
      )}

      {/* 🔤 Opciones para simplificar la respuesta */}
      {ambiguousStep !== 1 && showSimplificationOptions && (
        <>
          <div className="chat-container">
            <div className="robot-bubble">
              <img src={robotLogo} alt="OlivIA" className="robot-icon" />
              <p>¿Cómo quieres que te ayude?</p>
            </div>
          </div>
          <div className="chat-container">
            <div className="help-buttons">
              <button className="help-btn blue" onClick={requestSimplifiedResponse}>
                📝 Reformular toda la respuesta
              </button>
              <button className="help-btn yellow" onClick={toggleSynonymInput}>
                ✏️ Escribir palabras que no comprendo
              </button>
            </div>
          </div>

          {showTextInput && (
            <div className="chat-container">
              <textarea
                className="textarea-synonyms"
                placeholder="Escribe aquí las palabras que no comprendas..."
                value={unknownWords}
                onChange={(e) => setUnknownWords(e.target.value)}
              ></textarea>

              <button
                className="synonyms-btn"
                onClick={() => requestSynonyms(unknownWords)}
                style={{ marginTop: "10px" }}
              >
                🔍 Buscar sinónimos
              </button>
            </div>
          )}
        </>
      )}

      {/* ✅ Confirmación de comprensión */}
      {ambiguousStep !== 1 && showUsefulQuestion && !showConfirmationButton && (
        <>
            <div className="chat-container ai-container">
                <div className="robot-bubble">
                    <img src={robotLogo} alt="OlivIA" className="robot-icon" />
                    <p>¿Te ha quedado todo claro?</p>
                </div>
            </div>

            <div className="chat-container ai-container">
                <div className="help-buttons">
                    <button
                        className="help-btn gray"
                        onClick={() => {
                            setShowUsefulQuestion(false);
                            setShowHelpOptions(true);
                            setShowConfirmationButton(false);
                        }}
                    >
                        🤔 No, tengo todavía dudas
                    </button>
                    <button
                                className="help-btn green"
                                onClick={async () => await saveChatToHistory()}
                            >
                                😊 Sí, todo claro
                            </button>


                </div>
            </div>
        </>
    )}
      {/* ✅ Preguntar desde cero (solo si NO está aclarando una ambigüedad) */}
      {ambiguousStep !== 1 && showHelpOptions && (
        <div className="chat-container">
          <div
            className="custom-followup-box"
            style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}
          >
            <h1
              style={{ color: "black", fontSize: "1.2rem" }}
              className="custom-followup-title"
            >
              <strong>¿Prefieres formular la pregunta desde cero?</strong>
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <textarea
  id="customPrompt"
  className="custom-followup-textarea"
  placeholder="Escribe aquí tu pregunta..."
  aria-label="Escribe tu pregunta desde cero"
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  style={{
    flex: 1,
    borderRadius: "8px",
    padding: "8px",
    resize: "vertical",
  }}
></textarea>

              <button
                className="micro-btn"
                onClick={startListeningLocal}
                style={{
                  backgroundColor: "#FFE0B2",
                  border: "2px solid #FF9900",
                  borderRadius: "12px",
                  color: "#333333",
                  fontSize: "25px",
                  padding: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                🎤
              </button>
            </div>

            <button
              className="custom-followup-btn"
              onClick={handleSendPromptDesdeCero}
              style={{ marginTop: "10px" }}
            >
              🔍 ¡Descubrir Respuesta!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
