import { fetchFromGroq } from './apiFunctions';
import { useCallback, useState } from "react";

const usePromptFunctions = ({
  summary,
  chatFlow,
  setChatFlow,
  setPrompt,
  setLoading,
  setShowChat,
  setShowHelpOptions,
  setShowSimplificationOptions,
  setShowTextInput,
  resetHelpOptions,
  setActiveSpeechId,
  setSpeechState,
  prompt,
  selectedOption
}) => {
  const [ambiguousStep, setAmbiguousStep] = useState(0);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [clarifications, setClarifications] = useState([]);

  // ========= Normalización & detección de patrones claros =========
  const normalize = (txt = "") =>
    txt
      .toLowerCase()
      .trim()
      .replace(/^[¿¡]/, "")          // elimina ¿ o ¡ inicial
      .replace(/[?¡!]/g, "")         // elimina signos sueltos
      .normalize("NFD")              // quita tildes
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  // Preguntas claramente NO ambiguas (aunque falten tildes/signos)
  const isClearlyNonAmbiguous = (txt) => {
    const t = normalize(txt);
    // Patrones típicos de intención clara
    const clearPatterns = [
      /^que es\s+.+/,               // que es un perro
      /^que significa\s+.+/,        // que significa fotosintesis
      /^definicion de\s+.+/,        // definicion de ecosistema
      /^explicame\s+.+/,            // explicame la fotosintesis
      /^explicame con un ejemplo\s+.+/,
      /^como se hace\s+.+/,
      /^como funciona\s+.+/,
      /^dame un ejemplo de\s+.+/,
      /^resume en pocas palabras\s*.+/,
      /^resumen de\s+.+/,
      /^sinonimos de\s+.+/,
      /^dame sinonimos de\s+.+/,
      /^que diferencia hay entre\s+.+/
    ];
    return clearPatterns.some((rx) => rx.test(t));
  };

  // ========= Heurística de ambigüedad (con tolerancia a tildes/signos) =========
  const isAmbiguousHeuristic = (txt) => {
    const t = normalize(txt);
    if (!t) return false;

    // Si encaja en patrones claros, no es ambigua
    if (isClearlyNonAmbiguous(t)) return false;

    // Starters típicos de “podría ser ambigua” si además es muy corta
    const starters = ["que", "que es", "como", "como se", "por que", "cual", "donde", "cuando"];
    const short = t.split(/\s+/).length <= 4;

    // Si empieza por estas, y es demasiado corta, podría ser ambigua (p.ej. "cuando?", "como?")
    return starters.some((s) => t.startsWith(s)) && short;
  };

  // ========= Chequeo con el modelo, pero con reglas claras =========
  const isAmbiguousByAI = async (text) => {
    const instruction = `
Lee la consulta del usuario y responde solo "sí" o "no" a: ¿es AMBIGUA o poco clara?
Reglas IMPORTANTES:
- NO la consideres ambigua solo porque falten signos de interrogación o tildes.
- Si encaja en patrones como "que es X", "que significa X", "definicion de X", "como se hace X", "como funciona X", NO es ambigua.
- Marca como ambigua solo si, incluso con esas tolerancias, no queda claro qué quiere el usuario.
Consulta: "${text}"
`;
    const response = await fetchFromGroq([{ role: "user", content: instruction }]);
    return response?.toLowerCase().includes("sí");
  };

  const fetchReformulations = async (text) => {
    const clarificationPrompt = `Una persona con discapacidad cognitiva ha hecho esta pregunta ambigua: \"${text}\". Propón 3 reformulaciones más claras, en frases simples, útiles y directas. Devuelve solo las preguntas como una lista.`;
    const response = await fetchFromGroq([{ role: "user", content: clarificationPrompt }]);
    const lines = response.split("\n").filter(line => line.trim());
    return lines.map((line, index) => {
      const clean = line.replace(/^\d+[\).\s-]+/, "").trim();
      return {
        id: index + 1,
        value: clean,
        prompt: text
      };
    });
  };

  const buildPrompt = useCallback((promptText) => {
    if (!summary) return { displayPrompt: promptText, apiPrompt: promptText };
    const personalInfo = `
    Pero ten en cuenta estas instrucciones al responder:
    - Mi Discapacidad: ${summary.discapacidad?.join(", ") || "Ninguna"}
    - NO uses: ${summary.retos?.join(", ") || "Ninguna"}
    - Quiero que me generes la respuesta usando: ${summary.herramientas?.join(", ") || "Ninguna"}
    `;
    return {
      displayPrompt: promptText,
      apiPrompt: `Hola, respóndeme a esta pregunta y dame la respuesta directamente sin introducción: ${promptText}\n${personalInfo}`,
    };
  }, [summary]);

  const fetchPictograms = useCallback(async (displayPrompt, responseText) => {
    if (!responseText.trim()) return;
    setLoading(true);
    setShowChat(true);

    try {
      const stopwords = ["de", "la", "el", "y", "a", "en", "las", "ejemplo", "ejemplos", "*", "***", "**", "los", "del", "con", "por", "un", "una", "para", "al", "se", "que", "su", "o", "hola"];
      const lines = responseText.split("\n").filter(line => line.trim().length > 0);
      let bullets = [];

      for (const line of lines) {
        const cleanLine = line
          .replace(/Paso\s*\d+:*/i, "")
          .replace(/^\u27A1\ufe0f\s*\d+:*/i, "")
          .replace(/[\u2022:\u27A1\ufe0f]/g, "")
          .replace(/[\u{1F300}-\u{1F6FF}]/gu, "")
          .trim();

        const words = cleanLine.split(/\s+/).filter(word =>
          word.trim().length > 1 && !stopwords.includes(word.toLowerCase())
        );

        let wordPictos = [];

        for (const word of words) {
          const cleanWord = word.replace(/^[*]+|[*]+$|[.,!?¿¡;:()]/g, "").toLowerCase();

          try {
            const res = await fetch(`https://api.arasaac.org/v1/pictograms/es/search/${encodeURIComponent(cleanWord)}`);
            const pictograms = await res.json();

            if (Array.isArray(pictograms) && pictograms.length > 0) {
              wordPictos.push({
                word,
                pictos: pictograms.map(p => `https://static.arasaac.org/pictograms/${p._id}/${p._id}_500.png`),
                selectedIndex: 0
              });
            }
          } catch (error) {
            console.error("Error con palabra:", word, error);
          }
        }

        bullets.push({
          text: line.trim(),
          words: wordPictos
        });
      }

      setChatFlow(prev => [
        ...prev.filter((entry) => entry.type !== "loading"),
        { type: "ai-pictogram", content: { bullets } }
      ]);

    } catch (error) {
      console.error("Error general en fetchPictograms:", error);
    }

    setLoading(false);
  }, [setChatFlow]);

  const getLastAIResponse = () => {
    for (let i = chatFlow.length - 1; i >= 0; i--) {
      if (chatFlow[i].type === "ai") return chatFlow[i].content;
      if (chatFlow[i].type === "ai-pictogram") {
        return chatFlow[i].content?.bullets?.map(b => b.text).join("\n");
      }
    }
    return null;
  };

  const requestExample = async () => {
    const last = getLastAIResponse();
    if (last) await sendPrompt(`Dame un ejemplo sobre esto: ${last}`);
  };

  const requestSummary = async () => {
    const last = getLastAIResponse();
    if (last) await sendPrompt(`Hazme un resumen sobre esto: ${last}`);
  };

  const requestSimplifiedResponse = async () => {
    const last = getLastAIResponse();
    if (last) await sendPrompt(`Explícamelo más fácil: ${last}`);
  };

  const requestSynonyms = async (words) => {
    if (!words.trim()) return;
    await sendPrompt(`Explícame el significado de estas palabras difíciles: ${words}`);
  };

  const sendPrompt = useCallback(async (promptInput, selectedOption) => {
    if (!promptInput.trim()) return;

    const isContinuingAmbiguity = ambiguousStep > 0 && promptInput === prompt;
    if (!isContinuingAmbiguity) {
      setAmbiguousStep(0);
      setOriginalPrompt("");
      setClarifications([]);
    }

    window.speechSynthesis.cancel();
    setActiveSpeechId(null);
    setSpeechState("idle");
    resetHelpOptions();
    setShowChat(true);

    const checkText = selectedOption
      ? `${selectedOption.text} ${promptInput}${selectedOption.needsQuestionMark ? "?" : ""}`
      : promptInput;

    // ✅ Atajo: si es claramente NO ambigua (aunque falten tildes/interrogaciones), saltamos chequeos
    const skipAmbiguity = isClearlyNonAmbiguous(checkText);

    if (!skipAmbiguity && ambiguousStep === 0) {
      const maybeAmbiguous = isAmbiguousHeuristic(checkText);
      setChatFlow(prev => [...prev]);

      const confirmAmbiguous = await isAmbiguousByAI(checkText);
      setChatFlow(prev => [...prev]);

      if (confirmAmbiguous) {
        setOriginalPrompt(checkText);
        setChatFlow(prev => [
          ...prev,
          { type: "user", content: checkText },
          {
            type: "clarification-request",
            content: "Tu pregunta no está clara. ¿Puedes darme más información sobre lo que quieres saber?"
          }
        ]);
        setAmbiguousStep(1);
        setShowTextInput(true);
        setShowChat(true);
        return;
      }
    }

    const promptText = selectedOption
      ? `${selectedOption.text} ${promptInput}${selectedOption.needsQuestionMark ? "?" : ""}`
      : promptInput;

    const { displayPrompt, apiPrompt } = buildPrompt(promptText);

    setChatFlow(prev => [
      ...prev,
      { type: "user", content: displayPrompt },
      { type: "loading", content: "⌛ Cargando..." }
    ]);

    setLoading(true);
    const response = await fetchFromGroq([{ role: "user", content: apiPrompt }]);

    const usarPictogramas = summary?.herramientas?.some(h => h.toLowerCase().includes("pictograma"));

    if (!usarPictogramas) {
      setChatFlow(prev => [
        ...prev.filter((entry) => entry.type !== "loading"),
        { type: "ai", content: response }
      ]);
    } else {
      await fetchPictograms(displayPrompt, response);
    }

    setShowHelpOptions(true);
    setLoading(false);
    setPrompt("");
  }, [ambiguousStep, prompt, buildPrompt, fetchPictograms]);

  const handleAmbiguousClarification = async (clarificationText) => {
    setClarifications(prev => [...prev, clarificationText]);

    const allClarifications = [...clarifications, clarificationText]
      .map((text, i) => `(${i + 1}) ${text}`)
      .join("\n");

    const combinedPrompt = `
Un usuario hizo esta pregunta ambigua: "${originalPrompt}".

Después añadió estas aclaraciones:
${allClarifications}

Reformula su pregunta de forma clara, sencilla y directa. Devuelve solo 3 preguntas reformuladas como lista, sin responderlas.
`;

    setChatFlow(prev => [
      ...prev,
      { type: "user", content: clarificationText },
      { type: "loading", content: "⌛ Reformulando pregunta..." }
    ]);

    const reformulations = await fetchReformulations(combinedPrompt);

    setChatFlow(prev => [
      ...prev.filter(entry => entry.type !== "loading"),
      {
        type: "clarification-choices",
        content: reformulations
      }
    ]);

    setPrompt("");
    setShowTextInput(false);
    setAmbiguousStep(2);
  };

  const generateTitleFromChat = async () => {
    const conversation = chatFlow
      .filter(entry => entry.type === "user" || entry.type === "ai")
      .map(entry => `${entry.type === "user" ? "Usuario" : "IA"}: ${entry.content}`)
      .join("\n");

    const titlePrompt = `Lee esta conversación y dime un título corto (máximo 7 palabras) que represente de qué se trata. No uses comillas ni hagas una frase larga:\n\n${conversation}`;

    const messages = [{ role: "user", content: titlePrompt }];
    const response = await fetchFromGroq(messages);

    return response || "Conversación guardada";
  };

  const sendPromptQuestions = async (textInput) => {
    if (!textInput.trim()) return;

    setLoading(true);
    setChatFlow(prev => [
      ...prev,
      { type: "user", content: textInput },
      { type: "loading", content: "⌛ Buscando preguntas útiles..." }
    ]);

    const questionPrompt = `Una persona escribió: "${textInput}". Propón 3 preguntas claras que podrían ser lo que quiere saber. Devuélvelas como lista sin responderlas.`;
    const response = await fetchFromGroq([{ role: "user", content: questionPrompt }]);

    const questions = response.split("\n")
      .filter(line => line.trim())
      .map((line, i) => ({
        id: i + 1,
        value: line.replace(/^\d+[\.\)\s-]*/, "").trim(),
        prompt: textInput
      }));

    setChatFlow(prev => [
      ...prev.filter((entry) => entry.type !== "loading"),
      { type: "ai-questions", content: questions }
    ]);

    setLoading(false);
    setPrompt("");
    setShowChat(true);
    setShowTextInput(false);
  };

  return {
    sendPrompt,
    sendPromptQuestions,
    requestExample,
    requestSummary,
    requestSimplifiedResponse,
    requestSynonyms,
    ambiguousStep,
    handleAmbiguousClarification,
    generateTitleFromChat,
  };
};

export default usePromptFunctions;
