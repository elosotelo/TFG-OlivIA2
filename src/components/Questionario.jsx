/**
* Questionario.jsx — Versión Lectura Fácil (LF)
*
* Mejoras:
* - Lenguaje claro y frases cortas (LF).
* - Landmarks semánticos (<header>, <main>, <section>).
* - Jerarquía h1 > h2 > h3 sin saltos.
* - <label> asociado, ayudas con aria-describedby.
* - <fieldset>/<legend> para agrupar controles.
* - Explicación de siglas (TEA, TDAH) y términos.
* - Botones con type="button" y aria-label.
* - Región aria-live para mensajes dinámicos.
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
   setSummary((prev) => ({ ...prev, nombre: e.target.value }));
 };
 const togglediscapacidad = (id) => {
   setSummary((prev) => ({
     ...prev,
     discapacidad: prev.discapacidad.includes(id)
       ? prev.discapacidad.filter((item) => item !== id)
       : [...prev.discapacidad, id]
   }));
 };
 const toggleReto = (id) => {
   setSummary((prev) => ({
     ...prev,
     retos: prev.retos.includes(id)
       ? prev.retos.filter((item) => item !== id)
       : [...prev.retos, id]
   }));
 };
 const toggleTool = (id) => {
   setSummary((prev) => ({
     ...prev,
     herramientas: prev.herramientas.includes(id)
       ? prev.herramientas.filter((item) => item !== id)
       : [...prev.herramientas, id]
   }));
 };
 const tools = [
   { id: "ejemplo", label: "🖋️ Con ejemplos" },
   { id: "bullet", label: "📒 Listas con puntos" },
   { id: "textocorto", label: "📃 Texto breve" },
   { id: "frasescortas", label: "✂️ Frases cortas" },
   { id: "pictograma", label: "🖼️ Pictogramas" }
 ];
 const generateSummary = () => (
<section
     className="summary-box-horizontal"
     aria-labelledby="resumen-titulo"
     role="region"
>
<h2 id="resumen-titulo">Resumen de tu configuración</h2>
<div className="summary-row">
<span className="summary-title">🧑 Tu nombre:</span>
<span className="summary-data">{summary.nombre || "No indicado"}</span>
</div>
<div className="summary-row">
<span className="summary-title">⭐ Te identificas con:</span>
<ul className="summary-bubbles">
         {summary.discapacidad.length > 0 ? (
           summary.discapacidad.map((item) => <li key={item}>{item}</li>)
         ) : (
<li>No seleccionado</li>
         )}
</ul>
</div>
<div className="summary-row">
<span className="summary-title">📌 Te cuesta:</span>
<ul className="summary-bubbles">
         {summary.retos.length > 0 ? (
           summary.retos.map((item) => <li key={item}>{item}</li>)
         ) : (
<li>No seleccionado</li>
         )}
</ul>
</div>
<div className="summary-row">
<span className="summary-title">🧠 Te ayudará usando:</span>
<ul className="summary-bubbles">
         {summary.herramientas.length > 0 ? (
           summary.herramientas.map((toolId) => {
             const tool = tools.find((t) => t.id === toolId);
             return <li key={toolId}>{tool?.label || toolId}</li>;
           })
         ) : (
<li>No se seleccionó ninguna herramienta</li>
         )}
</ul>
</div>
</section>
 );
 const renderPage = () => {
   switch (page) {
     /* ------------------------ PANTALLA 1 ------------------------ */
     case 1:
       return (
<section
           className="question-page"
           aria-labelledby="titulo-bienvenida"
           role="region"
>
<header>
<img
               src={robotLogo}
               alt="Logotipo de OlivIA"
               className="robot-logo"
             />
</header>
<h1 id="titulo-bienvenida" style={{ color: "black" }}>
             Vamos a crear tu asistente
</h1>
<p id="intro-bienvenida">
             Te ayudará a entender la información y a resolver dudas.
</p>
<h2>Tu nombre</h2>
<p id="ayuda-nombre">
             Escribe tu nombre. Usamos tus respuestas para ayudarte mejor.
</p>
<label htmlFor="nombre" style={{ color: "black" }}>
             Tu nombre
</label>
<input
             id="nombre"
             type="text"
             placeholder="Escribe tu nombre aquí…"
             className="custom-input"
             value={summary.nombre}
             onChange={handleNameChange}
             aria-describedby="ayuda-nombre"
           />
           {/* Mensajes dinámicos accesibles */}
<div aria-live="polite" className="sr-only">
             {summary.nombre ? `Has escrito ${summary.nombre}` : ""}
</div>
</section>
       );
     /* ------------------------ PANTALLA 2 ------------------------ */
     case 2:
       return (
<section
           className="question-page"
           aria-labelledby="titulo-paso1"
           role="region"
>
<h1 id="titulo-paso1" style={{ color: "black" }}>
             ⭐ Paso 1. Cada persona es diferente
</h1>
<p id="ayuda-paso1-1">
             Cuéntanos con qué te identificas. Esto nos ayuda a adaptar la ayuda.
</p>
<p id="ayuda-paso1-2">Puedes marcar varias opciones.</p>
<fieldset
             className="toggle-options-container"
             aria-describedby="help-siglas"
>
<legend className="visually-hidden">Con qué te identificas</legend>
<p id="help-siglas" className="sr-only">
               TEA significa Trastorno del Espectro Autista. TDAH significa Trastorno por Déficit de Atención con Hiperactividad.
</p>
             {[
               { id: "TEA", label: "🧩 TEA (autismo)" },
               { id: "Dislexia", label: "🔠 Dislexia" },
               { id: "TDAH", label: "⚡ TDAH (déficit de atención)" },
               { id: "Memoria", label: "🧠 Dificultad de memoria" },
               { id: "Prefiero no responder", label: "❌ No responder" }
             ].map((option) => (
<div
                 key={option.id}
                 className={`toggle-option ${
                   summary.discapacidad.includes(option.id) ? "active" : ""
                 }`}
>
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
</fieldset>
</section>
       );
     /* ------------------------ PANTALLA 3 ------------------------ */
     case 3:
       return (
<section
           className="question-page"
           aria-labelledby="titulo-paso2"
           role="region"
>
<h1 id="titulo-paso2" style={{ color: "black" }}>
             🌟 Paso 2. ¿Qué te cuesta más?
</h1>
<p id="ayuda-paso2-1">Puedes marcar varias opciones.</p>
<p id="ayuda-paso2-2">
             Ejemplos: “Organizar ideas” = ordenar pasos. “Recordar” = datos o instrucciones.
</p>
<fieldset className="toggle-options-container">
<legend className="visually-hidden">Dificultades</legend>
             {[
               { id: "Textos Largos", label: "📖 Textos largos (mucho texto)" },
               { id: "Palabras Dificiles", label: "🧩 Palabras difíciles (técnicas)" },
               { id: "Organizar Ideas", label: "📝 Organizar ideas (ordenar pasos)" },
               { id: "Mantener Atencion", label: "🎯 Mantener la atención (tiempo)" },
               { id: "Memoria", label: "🧠 Recordar (datos o tareas)" }
             ].map((option) => (
<div
                 key={option.id}
                 className={`toggle-option ${
                   summary.retos.includes(option.id) ? "active" : ""
                 }`}
>
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
</fieldset>
</section>
       );
     /* ------------------------ PANTALLA 4 ------------------------ */
     case 4:
       return (
<section
           className="question-page"
           aria-labelledby="titulo-paso3"
           role="region"
>
<h1 id="titulo-paso3" style={{ color: "black" }}>
             🧭 Paso 3. ¿Cómo quieres las respuestas?
</h1>
<p id="ayuda-paso3-1">Elige cómo te resulta más fácil entender.</p>
<p id="ayuda-paso3-2">Puedes marcar varias opciones.</p>
<fieldset className="options-container">
<legend className="visually-hidden">Preferencias de respuesta</legend>
             {tools.map((tool) => (
<div
                 key={tool.id}
                 className={`option-box ${
                   summary.herramientas.includes(tool.id) ? "active" : ""
                 }`}
>
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
<li>
                         Un planeta es como una pelota grande que gira alrededor
                         del Sol. Ejemplo: la Tierra gira alrededor del Sol.
</li>
</ul>
                   )}
                   {tool.id === "bullet" && (
<ul>
<li>🪐 Cuerpo del espacio.</li>
<li>💫 Gira alrededor de una estrella.</li>
<li>🌍 Forma redonda.</li>
</ul>
                   )}
                   {tool.id === "textocorto" && (
<ul>
<li>
                         Un planeta gira alrededor de una estrella y tiene forma
                         redonda.
</li>
</ul>
                   )}
                   {tool.id === "frasescortas" && (
<ul>
<li>Es un cuerpo del espacio.</li>
<li>Gira alrededor de una estrella.</li>
<li>Tiene forma redonda.</li>
</ul>
                   )}
                   {tool.id === "pictograma" && (
<ul>
<li>
<div
                           style={{
                             display: "flex",
                             alignItems: "center",
                             gap: "8px",
                             flexWrap: "wrap",
                             marginTop: "10px"
                           }}
>
<img
                             src={pictogramaPlaneta}
                             alt="Pictograma: planeta"
                             style={{ width: "50px" }}
                           />
<span aria-hidden="true" style={{ fontSize: "1.5rem" }}>
                             +
</span>
<img
                             src={pictogramaEstrella}
                             alt="Pictograma: estrella"
                             style={{ width: "50px" }}
                           />
<span aria-hidden="true" style={{ fontSize: "1.5rem" }}>
                             =
</span>
<img
                             src={pictogramaTierra}
                             alt="Pictograma: Tierra"
                             style={{ width: "50px" }}
                           />
<span style={{ fontWeight: "bold" }}>
                             Un planeta gira alrededor de una estrella, como la
                             Tierra.
</span>
</div>
</li>
</ul>
                   )}
</div>
</div>
             ))}
</fieldset>
</section>
       );
     /* ------------------------ PANTALLA 5 ------------------------ */
     case 5:
       return (
<section
           className="question-page"
           aria-labelledby="titulo-final"
           role="region"
>
<h1 id="titulo-final" style={{ color: "black" }}>
             🎉 Paso final. OlivIA está lista
</h1>
<p>Gracias por contarnos cómo ayudarte mejor.</p>
           {generateSummary()}
<div className="robot-container" aria-hidden="true">
<img
               src={robotLogoCuerpo}
               alt=""
               className="robot-img"
               role="presentation"
             />
</div>
<h2>¿Todo está bien?</h2>
<p>Puedes cambiar algo o empezar ya.</p>
<div className="button-group">
<button
               type="button"
               className="final-btn gray"
               onClick={() => setPage(1)}
               aria-label="Volver al inicio para cambiar respuestas"
>
               🔄 Cambiar algo
</button>
<button
               type="button"
               className="final-btn green"
               onClick={() => onComplete(summary)}
               aria-label="Empezar con OlivIA"
>
               ✔️ Empezar
</button>
</div>
</section>
       );
     default:
       return null;
   }
 };
 return (
<>
<header className="sr-only" aria-hidden="false">
<h1>Configuración de OlivIA</h1>
</header>
<main className="container" role="main">
       {renderPage()}
<nav
         className={`nav-buttons ${page === 1 ? "center-nav" : "right-nav"}`}
         aria-label="Navegación del cuestionario"
>
         {page > 1 && page < 5 && (
<button
             type="button"
             className="back-btn"
             onClick={prevPage}
             aria-label="Ir a la pantalla anterior"
>
             Anterior
</button>
         )}
         {page < 5 && (
<button
             type="button"
             className="next-btn"
             onClick={nextPage}
             aria-label="Ir a la siguiente pantalla"
>
             Siguiente →
</button>
         )}
</nav>
<div className="treasure-map" aria-hidden="true">
         {treasureMap[page - 1]}
</div>
</main>
</>
 );
}
