/**
 * Questionario.jsx
 *
 * Este componente representa el cuestionario personalizado de OlivIA, con lógica de accesibilidad
 * y gestión de estado para cada paso. Incluye soporte para "Otra opción", marcado activo y
 * uso correcto de <label> y aria-label.
 */

import pictogramaPlaneta from "../assets/planeta.png";
import pictogramaEstrella from "../assets/estrella.png";
import pictogramaTierra from "../assets/Tierra.png";


import { useState } from "react";
import "../App.css";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";
import robotLogoCuerpo from "../assets/AventurIA_robotCuerposinfondo.png";

const treasureMap = [
    "📍- - - 🏆",
    "- 📍 - - 🏆",
    "- - 📍 - 🏆",
    "- - - 📍 🏆",
    "- - - - 🏆!"
];

export default function Questionario({ onComplete }) {
    const [page, setPage] = useState(1);

    const [summary, setSummary] = useState({
        nombre: "",
        discapacidad: [],
        retos: [],
        herramientas: [],
        mostrarPorPartes: false
    });

    const [otraData, setOtraData] = useState({
        caso2: { seleccionada: false, respuesta: "", guardada: false },
        caso3: { seleccionada: false, respuesta: "", guardada: false }
    });

    const nextPage = () => {
        if (page < 5) setPage(page + 1);
        else onComplete(summary);
    };

    const prevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNameChange = (e) => {
        setSummary(prev => ({ ...prev, nombre: e.target.value }));
    };

    const togglediscapacidad = (id) => {
        setSummary(prev => ({
            ...prev,
            discapacidad: prev.discapacidad.includes(id)
                ? prev.discapacidad.filter(item => item !== id)
                : [...prev.discapacidad, id]
        }));
    };

    const toggleReto = (id) => {
        setSummary(prev => ({
            ...prev,
            retos: prev.retos.includes(id)
                ? prev.retos.filter(item => item !== id)
                : [...prev.retos, id]
        }));
    };

    const toggleTool = (id) => {
        setSummary(prev => ({
            ...prev,
            herramientas: prev.herramientas.includes(id)
                ? prev.herramientas.filter(item => item !== id)
                : [...prev.herramientas, id]
        }));
    };

    const tools = [
        { id: "ejemplo", label: "🖋️ Usar ejemplos" },
        { id: "bullet", label: "📒 Respuestas en bullets" },
        { id: "textocorto", label: "📃 Texto corto" },
        { id: "frasescortas", label: "✂️ Frases cortas" },
        { id: "pictograma", label: "🖼️ Pictogramas" }
    ];

    const generateSummary = () => (
        <div className="summary-box-horizontal">
            <h3>Resumen de tu nueva compañera virtual:</h3>
            <div className="summary-row">
                <span className="summary-title">🧑 Tu nombre:</span>
                <span className="summary-data">{summary.nombre || "No indicado"}</span>
            </div>
            <div className="summary-row">
                <span className="summary-title">⭐ Te identificas con:</span>
                <ul className="summary-bubbles">
                    {summary.discapacidad.length > 0 ? (
                        summary.discapacidad.map(item => <li key={item}>{item}</li>)
                    ) : (
                        <li>No seleccionado</li>
                    )}
                </ul>
            </div>
            <div className="summary-row">
                <span className="summary-title">📌 Te cuesta:</span>
                <ul className="summary-bubbles">
                    {summary.retos.length > 0 ? (
                        summary.retos.map(item => <li key={item}>{item}</li>)
                    ) : (
                        <li>No seleccionado</li>
                    )}
                </ul>
            </div>
            <div className="summary-row">
                <span className="summary-title">🧠 Te ayudará usando:</span>
                <ul className="summary-bubbles">
                    {summary.herramientas.length > 0 ? (
                        summary.herramientas.map(toolId => {
                            const tool = tools.find(t => t.id === toolId);
                            return <li key={toolId}>{tool?.label || toolId}</li>;
                        })
                    ) : (
                        <li>No se seleccionó ninguna herramienta</li>
                    )}
                </ul>
            </div>
        </div>
    );

    const renderPage = () => {
        switch (page) {
            case 1:
                return (
                    <div className="question-page">
                        <img src={robotLogo} alt="Logo de OlivIA" className="robot-logo" />
                        <h1 style={{ color: "black" }}>¡Vamos a crear a tu Compañera Digital de Inteligencia Artificial!</h1>
                        <h2>Hoy vas a diseñar a OlivIA, tu compañera digital única, hecha a tu medida. Ella te ayudará a aprender, resolver dudas y acompañarte en tu día a día.</h2>
                        <h3>¿Cómo te llamas?</h3>
                        <label htmlFor="nombre" style={{ color: "black" }}>Introduce tu nombre:</label>
                        <input
                            id="nombre"
                            type="text"
                            placeholder="Escribe tu nombre aquí..."
                            className="custom-input"
                            value={summary.nombre}
                            onChange={handleNameChange}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="question-page">
                        <h1 style={{ color: "black" }}>⭐ Paso 1: Cada persona es única</h1>
                        <h2> Para que OlivIA pueda ayudarte mejor, quiere conocerte un poquito más.</h2>
                        <h3>¿Con qué te sientes más identificado?</h3>
                        <div className="toggle-options-container">
                            {[
                                { id: "TEA", label: "🧩 TEA" },
                                { id: "Dislexia", label: "🔠 Dislexia" },
                                { id: "TDAH", label: "⚡ TDAH" },
                                { id: "Memoria", label: "🧠 Memoria" },
                                { id: "Prefiero no responder", label: "❌ No responder" }
                            ].map(option => (
                                <div key={option.id} className={`toggle-option ${summary.discapacidad.includes(option.id) ? "active" : ""}`}>
                                    <span className="toggle-label">{option.label}</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={summary.discapacidad.includes(option.id)}
                                            onChange={() => togglediscapacidad(option.id)}
                                            aria-label={option.label}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="question-page">
                        <h1 style={{ color: "black" }}>🌟 Paso 2: ¡Haz que tu compañera digital sea tu mejor guía!</h1>
                        <h2>¿Qué te cuesta más entender?</h2>
                        <h3>Elige todas las que veas necesarias:</h3>
                        <div className="toggle-options-container">
                            {[
                                { id: "Textos Largos", label: "📖 Textos largos" },
                                { id: "Palabras Dificiles", label: "🧩 Palabras difíciles" },
                                { id: "Organizar Ideas", label: "📝 Organizar ideas" },
                                { id: "Mantener Atencion", label: "🎯 Mantener la atención" },
                                { id: "Memoria", label: "🧠 Recordar" }
                            ].map(option => (
                                <div key={option.id} className={`toggle-option ${summary.retos.includes(option.id) ? "active" : ""}`}>
                                    <span className="toggle-label">{option.label}</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={summary.retos.includes(option.id)}
                                            onChange={() => toggleReto(option.id)}
                                            aria-label={option.label}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="question-page">
                        <h1 style={{ color: "black" }}>🎭 Paso 3: Dale una personalidad a tu compañera virtual</h1>
                        <h2>¿Cómo quieres que te ayude tu compañero digital? Elige todas las opciones que veas necesarias:</h2>
                        <div className="options-container">
                            {tools.map(tool => (
                                <div key={tool.id} className={`option-box ${summary.herramientas.includes(tool.id) ? "active" : ""}`}>
                                    <div className="option-header">
                                        <span className="option-title">{tool.label}</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={summary.herramientas.includes(tool.id)}
                                                onChange={() => toggleTool(tool.id)}
                                                aria-label={tool.label}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="example-container">
                    <span className="example-title">Ejemplo:</span>
                    {tool.id === "ejemplo" && (
                      <ul>
                        <li>Un planeta es como una pelota gigante que gira alrededor de una luz muy fuerte, como el Sol. Por ejemplo, la Tierra gira alrededor del Sol.</li>
                      </ul>
                    )}
                    {tool.id === "bullet" && (
                      <ul>
                        <li>🪐 Cuerpo celeste.</li>
                        <li>💫 Órbita alrededor de una estrella.</li>
                        <li>🌍 Forma esférica.</li>
                      </ul>
                    )}
                    {tool.id === "textocorto" && (
                      <ul>
                        <li>Un planeta es un cuerpo celeste que gira alrededor de una estrella y tiene forma redonda.</li>
                      </ul>
                    )}
                    {tool.id === "frasescortas" && (
                      <ul>
                        <li>Es un cuerpo celeste. Orbita alrededor de una estrella. Tiene forma redonda.</li>
                      </ul>
                    )}
                    {tool.id === "pictograma" && (
                        <ul>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                            <img src={pictogramaPlaneta} alt="Pictograma de planeta" style={{ width: "50px" }} />
                            <span style={{ fontSize: "1.5rem" }}>+</span>
                            <img src={pictogramaEstrella} alt="Pictograma de estrella" style={{ width: "50px" }} />
                            <span style={{ fontSize: "1.5rem" }}>=</span>
                            <img src={pictogramaTierra} alt="Pictograma de Tierra" style={{ width: "50px" }} />
                            <span style={{ fontWeight: "bold" }}>
                            Un planeta gira alrededor de una estrella, como la Tierra.
                            </span>
                        </div>
                        </ul>
)}


                  </div>
                </div>
              ))}
            </div>
          </div>
        );
            case 5:
                return (
                    <div className="question-page">
                        <h1 style={{ color: "black" }}>🎉 Paso final: ¡OlivIA está lista para ayudarte! 🚀</h1>
                        <h2>Gracias por contarme cómo puedo ayudarte mejor.</h2>
                        {generateSummary()}
                        <div className="robot-container">
                            <img src={robotLogoCuerpo} alt="Compañero Virtual" className="robot-img" />
                        </div>
                        <h3>¿Quieres conocer a tu nueva compañera?</h3>
                        <div className="button-group">
                            <button className="final-btn gray" onClick={() => setPage(1)}>🔄 No, quiero cambiar algo</button>
                            <button className="final-btn green" onClick={() => onComplete(summary)}>✔️ Sí, estoy listo</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main className="container">
            {renderPage()}
            <div className={`nav-buttons ${page === 1 ? "center-nav" : "right-nav"}`}>
                {page > 1 && page < 5 && <button className="back-btn" onClick={prevPage}>Anterior</button>}
                {page < 5 && <button className="next-btn" onClick={nextPage}>Siguiente →</button>}
            </div>
            <div className="treasure-map">{treasureMap[page - 1]}</div>
        </main>
    );
}
