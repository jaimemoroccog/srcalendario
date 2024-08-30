// Basededatos.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const Basededatos = ({ setEvents }) => {
  useEffect(() => {
    axios.get('http://24.144.84.64/api/')
      .then(response => {
        const apiEvents = response.data.map(event => ({
          title: event.title,
          start: event.start,
          end: event.end,
          description: event.description,
          capacitador: event.capacitador,
          materials: event.materials,
        }));
        setEvents(apiEvents);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }, [setEvents]);

  return null; // Este componente no tiene UI, solo lógica de datos
};

export default Basededatos;
