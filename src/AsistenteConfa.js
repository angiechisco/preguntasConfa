import React, { useState, useEffect } from 'react';

import "./form.css";
import OpenAI from 'openai';
import DataTable from "react-data-table-component";
import Grid from "@mui/material/Grid";

const openai = new OpenAI({
  apiKey:process.env.REACT_APP_API_OPEN,dangerouslyAllowBrowser: true  // Reemplaza con tu clave de API
});
export default function AsistenteConfa() {
  const [prompt, setPrompt] = useState(''); // Para el texto ingresado por el usuario
  const [response, setResponse] = useState(''); // Para la respuesta del asistente
  const [loading, setLoading] = useState(false); // Estado para mostrar si está cargando
  const [thread, setThread] = useState(null); // Guardar el thread creado
  const assistantId = 'asst_5GXSDHtngTANnspOjhSav8bm'; // Reemplaza con el ID del asistente ya creado
//paco asst_imi9o0n71Gp9t1RKI6q8MnYV
  //vivienda asst_5GXSDHtngTANnspOjhSav8bm
  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt) return; // Si no hay prompt, no hacemos nada

    setLoading(true);

    try {
      // Crear un nuevo thread si no existe, verifica si existe, si existe lo usa sino crea uno
      let currentThread = thread;
      console.log('hilo existe >>'+currentThread);
      if (!currentThread) {
        currentThread = await openai.beta.threads.create();
        setThread(currentThread);
      }

      // Enviar el mensaje del usuario
      await openai.beta.threads.messages.create(currentThread.id, {
        role: "user",
        content: prompt,
      });

      // Configurar el stream para manejar la respuesta del asistente
      const run = openai.beta.threads.runs.stream(currentThread.id, {
        assistant_id: assistantId // Usar el ID del asistente ya creado
      })
        .on('textCreated', () => setResponse((prev) => prev + '\nConfanito > '))
        .on('textDelta', (textDelta) => setResponse((prev) => prev + textDelta.value))
        .on('toolCallCreated', (toolCall) => setResponse((prev) => prev + `\nConfanito > ${toolCall.type}\n\n`))
        .on('toolCallDelta', (toolCallDelta) => {
          if (toolCallDelta.type === 'code_interpreter') {
            if (toolCallDelta.code_interpreter.input) {
              console.log('toolCallDelta.code_interpreter.input>>'+toolCallDelta.code_interpreter.input);
              setResponse((prev) => prev + toolCallDelta.code_interpreter.input);
            }
            if (toolCallDelta.code_interpreter.outputs) {
              setResponse((prev) => prev + "\noutput >\n");
              toolCallDelta.code_interpreter.outputs.forEach(output => {
                console.log('output.type>>'+output.type);
                if (output.type === "logs") {
                  setResponse((prev) => prev + `\n${output.logs}\n`);
                }
              });
            }
           
          }
           console.log('toolCallDelta.type>2.-'+toolCallDelta.type);
           console.log('toolCallDelta. function_name>2.-'+toolCallDelta);
           console.log('toolCallDelta. function_name> json>>>.-'+JSON.stringify(toolCallDelta));
          // Detectar cuando el asistente pide ejecutar una función
          if (toolCallDelta.type === 'function') {//&& toolCallDelta.function_name === 'consultar_afiliado'
            consultar_afiliado(); // Llamar a la función personalizada
          }


        });

    } catch (error) {
      console.error('Error al enviar el mensaje al asistente:', error);
    } finally {
      setLoading(false);
      setPrompt(''); // Limpiar el campo de entrada
    }
  };




  async function consultar_afiliado() {
    console.log('Ejecutando la función consultar_afiliado...');
  
    const requestBody = { ndoc: "1193460100" };
  
    try {
      const response = await fetch('https://api-utilitarios.confa.co/replica/consultarAfiliadoDoc', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "AIabZtSVgS2nIVD03HQxY1cM6qLmRS8B3zHlw3qo"
        },
        body: JSON.stringify(requestBody)
      });
  
      console.log('Estado de la respuesta:', response.status);
  
      const text = await response.text();  // Obtener la respuesta como texto
      console.log('Respuesta del servidor:', text);
  
      // Intentar convertir la respuesta a JSON
      const data = JSON.parse(text);
  
      if (response.status === 500) {
        throw new Error(`Error del servidor: ${data.body}`);
      }
  
      if (typeof setResponse === 'function') {
        //setResponse((prev) => prev + `\nResultado de la consulta: ${JSON.stringify(data)}\n`);
        setResponse((prev) => prev + `\nOt registrada con Exito`);
      }
    } catch (error) {
      console.error('Error al consultar afiliado:', error);
  
      if (typeof setResponse === 'function') {
        setResponse((prev) => prev + `\nError al consultar afiliado: ${error.message}\n`);
      }
    }
  }

  function consultar_afiliado2() {
   // setResponse((prev) => prev + '\nEjecutando la función consultar_afiliado...\n');
    console.log('Ejecutando la función consultar_afiliado...');
   

    const requestBody = JSON.stringify({
      ndoc: "16071161"  // Documento a enviar
    });
  
    // Llamada al web service REST
    fetch('https://api-utilitarios.confa.co/replica/consultarAfiliadoDoc', { // Reemplaza con la URL de tu servicio
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "AIabZtSVgS2nIVD03HQxY1cM6qLmRS8B3zHlw3qo",
      },
      body: JSON.stringify(requestBody) // Enviando el body en formato JSON
    })
    .then(response => response.text()) // Parsear la respuesta JSON
    .then(data => {  
      console.log('Ejecutando la función resp:>>'+JSON.parse(data));
     // console.log('Ejecutando la función data>>'+JSON.parse(data));
      setResponse((prev) => prev + `\nResultado de la consulta>>: ${JSON.parse(data)}\n`);
    })
    .catch(error => {
      console.error('Error al consultar afiliado:', error);
      setResponse((prev) => prev + `\nError al consultar afiliado: ${error.message}\n`);
    });
  }
  

  
  return (
    <div>
      <div>
      <h1>
        Asistente conf<span style={{ color: 'red' }}>IA</span>
      </h1>
    </div>
   

    <form onSubmit={handleSubmit}>
    <Grid item xs={2}>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Escribe tu pregunta a ConfIA"
        disabled={loading}
        
      />
        
       
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Cargando...' : 'Enviar'}
      </button>
      </Grid>

    </form>

    <div >
    <h3>Asistente confa:</h3>
        {response.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}

    </div>
  </div>
  );
}
