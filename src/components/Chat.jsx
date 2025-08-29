import React from "react";
import ReactMarkdown from "react-markdown";

export default function Chat({
  chatFlow,
  expandedResponses,
  toggleExpanded,
  toggleSpeech,
  activeSpeechId,
  speechState,
  sendCustomPrompt,
  sendCustomQuestionsPrompt,
  handleClarificationChoice,
  ambiguousStep,
  prompt,
  setPrompt,
  handleAmbiguousClarification,
  handleVoiceRecognition,
  showTextInput,

  // ✅ NUEVO: handler para seleccionar una pregunta sugerida
  onSelectSuggestedQuestion,
}) {
  return (
    <div className="chat-wrapper">
      {chatFlow.map((entry, index) => (
        <div
          key={index}
          className={`chat-container ${
            entry.type === "user" ? "user-container" : "ai-container"
          }`}
        >
          {/* Mensaje del sistema */}
          {entry.type === "system" && (
            <div
              className="chat-message system-message"
              style={{
                backgroundColor: "#f0f0f0",
                color: "#333",
                fontStyle: "italic",
                borderLeft: "4px solid #999",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "6px",
              }}
            >
              {entry.content}
            </div>
          )}

          {/* Mensajes del usuario o IA */}
          <div
            className={`chat-message ${
              entry.type === "user" ? "user-message" : "ai-message"
            }`}
          >
            {entry.type === "user" && <ReactMarkdown>{entry.content}</ReactMarkdown>}

            {entry.type === "ai" && (
              <>
                <ReactMarkdown>
                  {expandedResponses[index] || entry.content.length <= 1000
                    ? entry.content
                    : entry.content.slice(0, 1000) + "…"}
                </ReactMarkdown>
                <div className="ai-bottom-row">
                  {entry.content.length > 1000 && (
                    <button className="see-more-btn" onClick={() => toggleExpanded(index)}>
                      {expandedResponses[index] ? "Ver menos" : "Ver más"}
                    </button>
                  )}
                  <button className="audio-btn" onClick={() => toggleSpeech(entry.content, index)}>
                    {activeSpeechId !== index || speechState === "idle"
                      ? "🔊"
                      : speechState === "playing"
                      ? "⏸️"
                      : "▶️"}
                  </button>
                </div>
              </>
            )}

            {/* Solicitud de aclaración explícita */}
            {entry.type === "clarification-request" && <p><em>{entry.content}</em></p>}

            {/* Pictogramas */}
            {entry.type === "ai-pictogram" &&
              entry.content?.bullets?.map((bullet, i) => (
                <div key={i} className="bullet-container" style={{ marginBottom: "30px" }}>
                  <div style={{ fontWeight: "bold", textAlign: "center", marginBottom: "10px" }}>
                    {bullet.text}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      gap: "25px",
                    }}
                  >
                    {bullet.words.map((wordData, j) => {
                      const hasImages = wordData.pictos && wordData.pictos.length > 0;
                      const currentPicto = hasImages
                        ? wordData.pictos[wordData.selectedIndex]
                        : "https://via.placeholder.com/80x80?text=❓";
                      const showButtons = hasImages && wordData.pictos.length > 1;
                      return (
                        <div key={j} style={{ width: "90px", textAlign: "center" }}>
                          {showButtons && (
                            <button
                              onClick={() => {
                                wordData.selectedIndex =
                                  (wordData.selectedIndex - 1 + wordData.pictos.length) %
                                  wordData.pictos.length;
                                toggleExpanded(Math.random()); // Forzar render
                              }}
                            >
                              ⬆️
                            </button>
                          )}
                          <img
                            src={currentPicto}
                            alt={wordData.word}
                            style={{ width: "80px", height: "80px", objectFit: "contain" }}
                          />
                          {showButtons && (
                            <button
                              onClick={() => {
                                wordData.selectedIndex =
                                  (wordData.selectedIndex + 1) % wordData.pictos.length;
                                toggleExpanded(Math.random()); // Forzar render
                              }}
                            >
                              ⬇️
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* Preguntas sugeridas */}
            {entry.type === "ai-questions" && Array.isArray(entry.content) && (
              <div className="ai-question-div" style={{ marginTop: "10px" }}>
                <p>Se han formulado las siguientes preguntas para ayudarte:</p>
                <div
                  className="ai-question-div-btns"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {entry.content.map((question, qIndex) => (
                    <button
                      key={qIndex}
                      className="ai-question"
                      onClick={() => {
                        const q = question.value;
                        if (onSelectSuggestedQuestion) onSelectSuggestedQuestion(q);
                        else sendCustomPrompt(q); // fallback
                      }}
                    >
                      <strong>#{question.id}-</strong> {question.value}
                    </button>
                  ))}
                  <button
                    key="more-questions"
                    className="ai-question-new"
                    onClick={() =>
                      sendCustomQuestionsPrompt(
                        "Formulá más preguntas de: ",
                        entry.content[0]?.prompt || ""
                      )
                    }
                  >
                    ➕ ¡Formular más preguntas!
                  </button>
                </div>
              </div>
            )}

            {/* Reformulaciones de ambigüedad */}
            {entry.type === "clarification-choices" && Array.isArray(entry.content) && (
              <div className="clarification-options" style={{ marginTop: "10px" }}>
                <p>¿Te refieres a alguna de estas preguntas?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {entry.content.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      className="ai-question"
                      onClick={() => handleClarificationChoice(option.value)}
                    >
                      {option.value}
                    </button>
                  ))}
                  <button className="ai-question-new" onClick={() => handleClarificationChoice(null)}>
                    ❌ Ninguna de las anteriores
                  </button>
                </div>
              </div>
            )}

            {/* Imagen generada */}
            {entry.type === "ai-image" && typeof entry.content === "string" && (
              <img
                src={entry.content}
                alt="Imagen generada por IA"
                className="ai-image"
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />
            )}

            {/* Fallback: mensaje desconocido */}
            {![
              "user",
              "ai",
              "system",
              "clarification-request",
              "clarification-choices",
              "ai-questions",
              "ai-image",
              "ai-pictogram",
            ].includes(entry.type) && (
              <p style={{ fontStyle: "italic", color: "gray" }}>
                ⌛ Cargando...
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Caja de aclaración siempre abajo si hace falta */}
      {(ambiguousStep === 1 || showTextInput) && (
        <div className="clarification-box" style={{ marginTop: "20px" }}>
          <h3>Aclara un poco más tu pregunta</h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              className="question-input"
              placeholder="Aclárame mejor tu duda..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="discover-btn"
              onClick={() => handleAmbiguousClarification(prompt)}
            >
              ✅ Enviar
            </button>
            <button className="micro-btn" onClick={handleVoiceRecognition}>
              🎤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
