import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { fetchMetadata } from 'html-metadata-parser'; // Importa la función para obtener metadatos
import './index.css';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [urlPreviews, setUrlPreviews] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = useState('4xl');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/')
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
    if (clickInfo.event.extendedProps.materials) {
      fetchLinkPreviews(clickInfo.event.extendedProps.materials);
    }
    onOpen(); // Abre el modal cuando se hace clic en un evento
  };

  const fetchLinkPreviews = async (materials) => {
    const previews = await Promise.all(
      materials
        .filter(material => material.link)
        .map(async (material) => {
          try {
            const metadata = await fetchMetadata(material.link);
            return { ...material, metadata };
          } catch (error) {
            console.error('Error fetching metadata for link:', material.link, error);
            return { ...material, metadata: null };
          }
        })
    );
    setUrlPreviews(previews);
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
          <ModalContent>
            {() => (
              <>
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
                      <ul>
                        {selectedEvent.extendedProps.materials.map((material, index) => (
                          <li key={index}>
                            {material.archivo && (
                              <a href={material.archivo} download>{material.descripcion}</a>
                            )}
                            {material.link && (
                              <div>
                                <a href={material.link} target="_blank" rel="noopener noreferrer">{material.descripcion}</a>
                                {urlPreviews.find(preview => preview.link === material.link)?.metadata && (
                                  <div>
                                    <h4>{urlPreviews.find(preview => preview.link === material.link)?.metadata.title}</h4>
                                    <img
                                      src={urlPreviews.find(preview => preview.link === material.link)?.metadata.image}
                                      alt={material.descripcion}
                                      style={{ maxWidth: '100px' }}
                                    />
                                    <p>{urlPreviews.find(preview => preview.link === material.link)?.metadata.description}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

export default App;
