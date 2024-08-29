import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { View, Text } from 'react-native';
import UrlPreview from 'react-native-url-preview';
import './index.css';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = useState('4xl');

  useEffect(() => {
    axios.get('http://0.0.0.0:7000/')
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
  }, []);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    onOpen(); // Abre el modal cuando se hace clic en un evento
  };

  return (
    <div className="App p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Calendario de Eventos</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        locale="es"
        height="auto"
      />

      {selectedEvent && (
        <Modal 
          size={size} 
          isOpen={isOpen} 
          onClose={onClose} 
        >
          <ModalHeader className="flex flex-col gap-1">
            {selectedEvent.title}
          </ModalHeader>
          <ModalBody>
            <p><strong>Fecha de inicio:</strong> {selectedEvent.start.toLocaleString()}</p>
            <p><strong>Fecha de finalización:</strong> {selectedEvent.end?.toLocaleString()}</p>
            <p><strong>Descripción:</strong> {selectedEvent.extendedProps.description}</p>
            <p><strong>Capacitador:</strong> {selectedEvent.extendedProps.capacitador}</p>
            {selectedEvent.extendedProps.materials && (
              <div>
                <strong>Materiales:</strong>
                <div className="flex flex-col gap-3">
                  {selectedEvent.extendedProps.materials.map((material, index) => (
                    <div key={index}>
                      <p>{material.descripcion}</p>
                      {material.link ? (
                        <UrlPreview url={material.link} />
                      ) : (
                        <a href={material.archivo}>{material.archivo}</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default App;
