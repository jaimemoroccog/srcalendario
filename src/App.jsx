import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { fetchMetadata } from 'html-metadata-parser'; // Importa la función para obtener metadatos
import './index.css'; // Asegúrate de incluir el archivo CSS
import { Link } from "@nextui-org/react";

function App() {
  // ** Estado para manejar eventos y datos del modal **
  const [events, setEvents] = useState([]); // Almacena los eventos obtenidos de la API
  const [selectedEvent, setSelectedEvent] = useState(null); // Almacena el evento seleccionado para el modal
  const [urlPreviews, setUrlPreviews] = useState([]); // Almacena las vistas previas de los enlaces
  const { isOpen, onOpen, onClose } = useDisclosure(); // Hook para manejar el estado del modal
  const [size, setSize] = useState('xl'); // Tamaño del modal

  // ** Recolección de datos de la base de datos **
  useEffect(() => {
    // Realiza una solicitud GET a la API para obtener eventos
    axios.get('http://24.144.84.64/api/')
      .then(response => {
        // Mapea los datos de la respuesta a un formato adecuado para el calendario
        const apiEvents = response.data.map(event => ({
          title: event.title, // Título del evento
          start: event.start, // Fecha y hora de inicio
          end: event.end, // Fecha y hora de finalización
          description: event.description, // Descripción del evento
          capacitador: event.capacitador, // Nombre del capacitador
          materials: event.materials, // Materiales asociados al evento
          className: isPastDate(event.start) ? 'past-event' : 'future-event', // Clase CSS basada en la fecha
        }));
        setEvents(apiEvents); // Actualiza el estado con los eventos obtenidos
      })
      .catch(error => {
        console.error('Error fetching events:', error); // Maneja errores de la solicitud
      });
  }, []);

  // ** Función para verificar si la fecha ha pasado o es futura **
  const isPastDate = (date) => {
    const now = new Date();
    return new Date(date) < now;
  };

  // ** Maneja el scroll al abrir/cerrar el modal **
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Deshabilita el scroll al abrir el modal
    } else {
      document.body.style.overflow = 'auto'; // Habilita el scroll al cerrar el modal
    }

    return () => {
      document.body.style.overflow = 'auto'; // Asegura que el scroll se reestablezca al desmontar el componente
    };
  }, [isOpen]);

  // ** Función para manejar clics en eventos del calendario **
  const handleEventClick = (clickInfo) => {
    // Establece el evento seleccionado en el estado
    setSelectedEvent(clickInfo.event);
    if (clickInfo.event.extendedProps.materials) {
      // Si el evento tiene materiales, obtén las vistas previas de los enlaces
      fetchLinkPreviews(clickInfo.event.extendedProps.materials);
    }
    onOpen(); // Abre el modal cuando se hace clic en un evento
  };

  // ** Función para obtener vistas previas de enlaces **
  const fetchLinkPreviews = async (materials) => {
    const previews = await Promise.all(
      materials
        .filter(material => material.link) // Filtra materiales que tienen enlaces
        .map(async (material) => {
          try {
            // Obtiene metadatos del enlace
            const metadata = await fetchMetadata(material.link);
            return { ...material, metadata };
          } catch (error) {
            console.error('Error fetching metadata for link:', material.link, error); // Maneja errores de la obtención de metadatos
            return { ...material, metadata: null }; // Devuelve material con metadatos nulos en caso de error
          }
        })
    );
    setUrlPreviews(previews); // Actualiza el estado con las vistas previas de los enlaces
  };

  return (
    <div className="App">
      <h1 className="text-2xl font-bold text-center mb-4">CALENDARIO: CHARLAS DIÁRIAS - GEOTÉCNIA MINSUR S.A.</h1>
      <h2 className="text-3xl font-bold text-center mb-4">ÁREA DE GEOTECNIA</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]} // Plugins utilizados en el calendario
        initialView="dayGridMonth" // Vista inicial del calendario
        events={events} // Eventos que se mostrarán en el calendario
        eventClick={handleEventClick} // Función que se llama al hacer clic en un evento
        headerToolbar={{
          left: 'prev,next today', // Botones para cambiar de mes
          center: 'title', // Título del calendario
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // Vistas disponibles
        }}
        locale="es" // Configura el calendario en español
        height="auto" // Ajusta la altura del calendario automáticamente
      />

      {/* ** Modal para detalles del evento ** */}
      {selectedEvent && (
        <Modal
          backdrop="blur" // Usa 'blur' para aplicar el efecto de desenfoque
          size={size} // Tamaño del modal
          isOpen={isOpen} // Controla si el modal está abierto o cerrado
          onClose={onClose} // Función para cerrar el modal
          css={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }} // Estilo CSS para el desenfoque del fondo
          className="modal" // Añadir clase modal para el estilo
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-center">
                  {selectedEvent.title} {/* Título del evento */}
                </ModalHeader>
                <ModalBody>
                  <p><strong>CAPACITADOR:</strong> {selectedEvent.extendedProps.capacitador}</p>
                  <p><strong>FECHA DE INICIO:</strong> {selectedEvent.start.toLocaleString()}</p>
                  <p><strong>FECHA DE FINALIZACIÓN:</strong> {selectedEvent.end?.toLocaleString()}</p>
                  <p><strong>DESCRIPCIÓN:</strong> {selectedEvent.extendedProps.description}</p>
                  {selectedEvent.extendedProps.materials && (
                    <div>
                      <strong>MATERIALES:</strong>
                      <ul>
                        {selectedEvent.extendedProps.materials.map((material, index) => (
                          <li key={index}>
                            {material.archivo && (
                              <a href={material.archivo} download>{material.descripcion}</a> // Enlace para descargar archivos
                            )}
                            {material.link && (
                              <div>
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
                            <div className="flex gap-2">
                              <Link
                                isBlock
                                showAnchorIcon
                                href={material.link}
                                color="primary"
                                target='_blank'
                              >
                                {material.descripcion}
                              </Link>
                            </div>
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
