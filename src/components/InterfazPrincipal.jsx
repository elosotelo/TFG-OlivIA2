import { useState } from "react";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";
import usePromptFunctions from "./Prompts";
import ConfigPanel from "./ConfigPanel";
import ChatHistory from "./ChatHistory";
import Chat from "./Chat";
import BotonesInteraccion from "./BotonesInteraccion";

export default function InterfazPrincipal({ summary }) {
  // ======= ESTADOS PRINCIPALES =======
  const [selectedOption, setSelectedOption] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatFlow, setChatFlow] = useState([]);
  const [showHelpOptions, setShowHelpOptions] = useState(false);
  const [showSimplificationOptions, setShowSimplificationOptions] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [unknownWords, setUnknownWords] = useState("");
  const [speechState, setSpeechState] = useState("idle");
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const [expandedResponses, setExpandedResponses] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [isSavingChat, setIsSavingChat] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [savedEffect, setSavedEffect] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempSummary, setTempSummary] = useState({ ...summary });
  const [otraOpciones, setOtraOpciones] = useState({
    discapacidad: { activa: false, valor: "", guardado: false },
    retos: { activa: false, valor: "", guardado: false },
  });
  const [showUsefulQuestion, setShowUsefulQuestion] = useState(false);
  const [showConfirmationButton, setShowConfirmationButton] = useState(false);

  const options = [
    { id: 1, text: "Dame un ejemplo de", color: "yellow" },
    { id: 2, text: "Explícame con un ejemplo", color: "blue" },
    { id: 3, text: "Resume en pocas palabras", color: "green" },
    { id: 4, text: "¿Qué significa", color: "red", needsQuestionMark: true },
    { id: 5, text: "Dame sinónimos de", color: "purple" },
    { id: 6, text: "¿Cómo se hace", color: "orange", needsQuestionMark: true },
  ];

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setPrompt("");
  };

  const handleResetQuestion = () => {
    setSelectedOption(null);
    setPrompt("");
  };

  // ======= PROMPTS / LÓGICA IA =======
  const {
    sendPrompt,
    sendCustomPrompt,
    sendPromptQuestions,
    requestSummary,
    requestExample,
    requestSimplifiedResponse,
    requestSynonyms,
    generateTitleFromChat,
    ambiguousStep,
    handleAmbiguousClarification,
  } = usePromptFunctions({
    summary,
    chatFlow,
    setChatFlow,
    setPrompt,
    setLoading,
    setShowChat,
    setShowHelpOptions,
    setShowSimplificationOptions,
    setShowTextInput,
    resetHelpOptions: () => {
      setShowHelpOptions(false);
      setShowSimplificationOptions(false);
      setShowTextInput(false);
    },
    setActiveSpeechId,
    setSpeechState,
    prompt,
    selectedOption,
  });

  // ======= UI: expandir/colapsar respuestas =======
  const toggleExpanded = (index) => {
    setExpandedResponses((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ======= HISTORIAL =======
  const toggleHistory = () => setShowHistory((v) => !v);

  const saveChatToHistory = async (clearAfter = true) => {
    if (chatFlow.length === 0) return;
    setIsSavingChat(true);

    const aiGeneratedTitle = await generateTitleFromChat();

    if (activeChat) {
      const updated = chatHistory.map((entry) =>
        entry === activeChat
          ? { ...entry, flow: [...chatFlow], timestamp: new Date().toLocaleString() }
          : { ...entry, isNew: false }
      );
      setChatHistory(updated);
    } else {
      const chatEntry = {
        title: aiGeneratedTitle,
        flow: [...chatFlow],
        timestamp: new Date().toLocaleString(),
        isNew: true,
      };
      setChatHistory([...chatHistory.map((e) => ({ ...e, isNew: false })), chatEntry]);
    }

    if (clearAfter) {
      setShowUsefulQuestion(false);
      setSelectedOption(null);
      setPrompt("");
      setShowChat(false); // oculta el chat
      setChatFlow([]);
      setShowHistory(true); // muestra el historial como en la versión anterior
    }

    setShowHelpOptions(true);
    setIsSavingChat(false);
  };

  // ======= ACLARACIONES AMBIGUAS =======
  const handleClarificationChoice = (selectedText) => {
    if (selectedText) {
      sendPrompt(selectedText);
    } else {
      setChatFlow((prev) => [
        ...prev,
        {
          type: "system",
          content: "No entiendo muy bien tu pregunta, ¿puedes darme más información?",
        },
      ]);
      setShowTextInput(true);
    }
  };

  // ======= VOZ (STT) =======
  const handleVoiceRecognition = () => {
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
      if (ambiguousStep === 1) {
        handleAmbiguousClarification(transcript);
      }
    };

    recognition.onerror = () => {
      console.log("❌ Error en el reconocimiento");
    };

    recognition.start();
  };

  // ✅ Handler central para clic en preguntas sugeridas
  const handleSuggestedQuestionClick = (questionText) => {
    if (!questionText) return;
    setSelectedOption(null);
    setPrompt(questionText);
    sendPrompt(questionText, null);
  };

  return (
    <main className="app-wrapper">
      {/* ======= BARRA SUPERIOR (HISTORIAL + CONFIG) ======= */}
      <div className="header-bar">
        <div className="header-title">OlivIA</div>

        <div className="header-actions">
          <button
            className={`history-btn ${showHistory ? "open" : "closed"}`}
            onClick={toggleHistory}
          >
            {showHistory ? "📁 Cerrar Historial" : "📂 Abrir Historial"}
          </button>

          <button
            className={`config-btn ${showConfig ? "open" : "closed"}`}
            onClick={() => setShowConfig((v) => !v)}
          >
            {showConfig ? "⚙️ Cerrar Configuración" : "⚙️  Configuración"}
          </button>
        </div>

        {/* HISTORIAL SIEMPRE DISPONIBLE (no depende de showChat) */}
        <ChatHistory
          showHistory={showHistory}
          chatHistory={chatHistory}
          activeChat={activeChat}
          chatFlow={chatFlow}
          setActiveChat={setActiveChat}
          setChatFlow={setChatFlow}
          setShowChat={setShowChat}
          setShowHelpOptions={setShowHelpOptions}
          setChatHistory={setChatHistory}
        />
      </div>

      {/* PANEL DE CONFIGURACIÓN */}
      {showConfig && (
        <ConfigPanel
          summary={summary}
          tempSummary={tempSummary}
          setTempSummary={setTempSummary}
          otraOpciones={otraOpciones}
          setOtraOpciones={setOtraOpciones}
          savedEffect={savedEffect}
          setSavedEffect={setSavedEffect}
          setEditingField={setEditingField}
        />
      )}

      {/* ======= PANTALLA INICIAL / CHAT ======= */}
      {!showChat ? (
        <>
          <img src={robotLogo} alt="Logo de OlivIA" className="robot-logo" />
          <h1 className="title">
            {summary?.nombre
              ? `Hola ${summary.nombre}, ¿Qué vamos a aprender hoy?`
              : "Hola ¿Qué vamos a aprender hoy?"}
          </h1>

          <div className="box-container">
            <div className="grid">
              {options.map((option) => (
                <button
                  key={option.id}
                  className={`btn ${option.color}`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option.text} ___{option.needsQuestionMark ? " ?" : ""}
                </button>
              ))}
            </div>

            <button className="custom-btn" onClick={handleResetQuestion}>
              Formular una pregunta desde cero
            </button>
          </div>

          <div className={`question-container ${selectedOption ? selectedOption.color : ""}`}>
            <h1 className="question-title">
              {selectedOption ? selectedOption.text : "Formula una pregunta"}
            </h1>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
  type="text"
  className="question-input"
  placeholder="Escribe aquí..."
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  aria-label="Escribe tu pregunta"
  style={{ flex: 1 }}
/>

              <button
                className="discover-btn"
                onClick={() => sendPrompt(prompt, selectedOption)}
              >
                🔍
              </button>

              {selectedOption == null && (
                <button
                  disabled={!prompt.trim()}
                  className="discover-btn-question"
                  onClick={() => sendPromptQuestions(prompt)}
                >
                  ❓ ¡Descubrir Preguntas!
                </button>
              )}

              <button className="micro-btn" onClick={handleVoiceRecognition}>
                🎤
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <Chat
            chatFlow={chatFlow}
            expandedResponses={expandedResponses}
            toggleExpanded={toggleExpanded}
            toggleSpeech={(text, id) => {
              if (activeSpeechId !== id) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = "es-ES";
                utterance.onstart = () => {
                  setActiveSpeechId(id);
                  setSpeechState("playing");
                };
                utterance.onend = () => {
                  setSpeechState("idle");
                  setActiveSpeechId(null);
                };
                window.speechSynthesis.speak(utterance);
              } else if (speechState === "playing") {
                window.speechSynthesis.pause();
                setSpeechState("paused");
              } else if (speechState === "paused") {
                window.speechSynthesis.resume();
                setSpeechState("playing");
              }
            }}
            activeSpeechId={activeSpeechId}
            speechState={speechState}
            sendCustomPrompt={sendCustomPrompt}
            sendCustomQuestionsPrompt={sendPromptQuestions}
            handleClarificationChoice={handleClarificationChoice}
            ambiguousStep={ambiguousStep}
            prompt={prompt}
            setPrompt={setPrompt}
            handleAmbiguousClarification={handleAmbiguousClarification}
            handleVoiceRecognition={handleVoiceRecognition}
            showTextInput={showTextInput}
            // ✅ pasa el handler de selección
            onSelectSuggestedQuestion={handleSuggestedQuestionClick}
          />

          <BotonesInteraccion
            prompt={prompt}
            setPrompt={setPrompt}
            setSelectedOption={setSelectedOption}
            showHelpOptions={showHelpOptions}
            showSimplificationOptions={showSimplificationOptions}
            showTextInput={showTextInput}
            unknownWords={unknownWords}
            setUnknownWords={setUnknownWords}
            requestExample={requestExample}
            requestSummary={requestSummary}
            requestSimplifiedResponse={requestSimplifiedResponse}
            requestSynonyms={requestSynonyms}
            toggleSynonymInput={() => setShowTextInput(!showTextInput)}
            handleSimplification={() => setShowSimplificationOptions(!showSimplificationOptions)}
            closeRedButtonOptions={() => {
              setShowSimplificationOptions(false);
              setShowTextInput(false);
            }}
            setShowHelpOptions={setShowHelpOptions}
            setShowUsefulQuestion={setShowUsefulQuestion}
            showUsefulQuestion={showUsefulQuestion}
            showConfirmationButton={showConfirmationButton}
            setShowConfirmationButton={setShowConfirmationButton}
            saveChatToHistory={saveChatToHistory}
            sendCustomPrompt={sendCustomPrompt}
            selectedOption={selectedOption}
            sendCustomQuestionsPrompt={sendPromptQuestions}
            sendPrompt={sendPrompt}
          />
        </>
      )}
    </main>
  );
}
