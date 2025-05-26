import { useEffect, useRef, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { GridStack } from "gridstack";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Swal from 'sweetalert2';

import { useCardStore, useStatusStore, useBoardStore } from "../../../hooks";
import { CardDTO, CardItem, Navbar, CardModal, WebSocketChat } from "../../../management";

import "../style/CardPage.css";
import LogoTaskor from '../../icons/LogoTaskor.png';

declare global {
  interface HTMLElement {
    gridstackNode?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    };
  }
}

interface GridStackElement extends HTMLElement {
  gridstackNode?: {
    x?: number;
    y?: number;
    el?: HTMLElement;
  };
}

export const CardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const parsedBoardId = parseInt(boardId || "", 10);
  const { clearCards, ...restCardStore } = useCardStore();
  const { clearStatuses, ...restStatusStore } = useStatusStore();
  const { activeBoard, boards, setActiveBoard, startLoadingBoards } = useBoardStore();

  const gridRefs = useRef<{ [key: number]: GridStack }>({});
  window.gridRefs = gridRefs.current;
  const isDraggingRef = useRef(false);
  const [forceRender, setForceRender] = useState(0);
  const [draggedItem, setDraggedItem] = useState<{
    cardId: number;
    originalStatusId: number;
  } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardDTO | null>(null);
  const hasLoadedCards = useRef<Set<number>>(new Set());
  const [showChat, setShowChat] = useState(false);

  const cardsByStatusRef = useRef(restCardStore.cardsByStatus);

  const columnsRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const columns = columnsRef.current;
    const scrollbar = scrollbarRef.current;
    if (!columns || !scrollbar) return;

    scrollbar.scrollLeft = columns.scrollLeft;

    const syncScroll = () => {
      scrollbar.scrollLeft = columns.scrollLeft;
    };
    const syncScrollBar = () => {
      columns.scrollLeft = scrollbar.scrollLeft;
    };

    columns.addEventListener("scroll", syncScroll);
    scrollbar.addEventListener("scroll", syncScrollBar);

    return () => {
      columns.removeEventListener("scroll", syncScroll);
      scrollbar.removeEventListener("scroll", syncScrollBar);
    };
  }, []);

  useEffect(() => {
    cardsByStatusRef.current = restCardStore.cardsByStatus;
  }, [restCardStore.cardsByStatus]);

  const lastBoardId = useRef<number | null>(null);

  useEffect(() => {
    if (!isNaN(parsedBoardId)) {
      clearCards();
      clearStatuses();
      lastBoardId.current = parsedBoardId;

      if (!activeBoard || activeBoard.id !== parsedBoardId) {
        const found = boards?.find(b => b.id === parsedBoardId);
        if (found) {
          setActiveBoard(found);
        } else {
          startLoadingBoards().then(() => {
            const updated = boards?.find(b => b.id === parsedBoardId);
            if (updated) setActiveBoard(updated);
          });
        }
      }
      restStatusStore.loadStatuses(parsedBoardId);
    }
    return () => {
      clearCards();
      clearStatuses();
      lastBoardId.current = null;
    };
  }, [parsedBoardId]);

  useEffect(() => {
    if (!isNaN(parsedBoardId) && restStatusStore.statuses.length > 0) {
      restStatusStore.statuses.forEach((status) => {
        if (status.id !== undefined && !hasLoadedCards.current.has(status.id)) {
          restCardStore.startLoadingCardsByBoardAndStatus(parsedBoardId, status.id);
          hasLoadedCards.current.add(status.id);
        }
      });
    }
  }, [parsedBoardId, restStatusStore.statuses]);

  const toggleMenu = (statusId: number) => {
    setOpenMenuId(openMenuId === statusId ? null : statusId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const menuRef = menuRefs.current[openMenuId];
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (restStatusStore.statuses.length > 0) {
      restStatusStore.statuses.forEach((status) => {
        if (status.id === undefined) return;

        const statusId = status.id;
        const gridEl = document.getElementById(`cardpage-custom-grid-${statusId}`);
        if (!gridEl || !gridEl.offsetParent) return;

        if (!gridRefs.current[statusId]) {
          const grid = GridStack.init(
            {
              float: false,
              animate: true,
              cellHeight: 135,
              disableResize: true,
              disableDrag: false,
              column: 1,
              minRow: 1,
              acceptWidgets: true,
              removable: false,
              resizable: { handles: "" },
              draggable: {
                handle: ".cardpage-grid-item-content",
                scroll: false,
              },
              alwaysShowResizeHandle: false,
            },
            gridEl
          );

          gridRefs.current[statusId] = grid;

          const saveMovedCard = async (
            cardId: number,
            newStatusId: number,
            newPosition: number
          ) => {
            let card: CardDTO | undefined;
            Object.values(cardsByStatusRef.current)
              .flat()
              .forEach((c) => {
                if (c.id === cardId) card = c;
              });

            if (!card) return;

            const gridEl = document.getElementById(`cardpage-custom-grid-${newStatusId}`);
            if (!gridEl) return;

            const items = Array.from(
              gridEl.querySelectorAll(".cardpage-grid-item")
            ) as HTMLElement[];

            const allCards: CardDTO[] = Object.values(cardsByStatusRef.current).flat();
            const cardMap: { [id: number]: CardDTO } = {};
            allCards.forEach((c) => {
              cardMap[c.id] = c;
            });

            const updatedCards: CardDTO[] = items
              .map((item) => {
                const id = parseInt(item.getAttribute("data-id") || "0", 10);
                const foundCard = cardMap[id];
                if (!foundCard) return null;

                const newPosition = item.gridstackNode?.y ?? 0;

                return {
                  ...foundCard,
                  status_id: newStatusId,
                  position: newPosition,
                };
              })
              .filter(Boolean) as CardDTO[];

            if (updatedCards.length > 0) {
              await restCardStore.startSavingMultipleCards(updatedCards);
            }

            setTimeout(() => {
              isDraggingRef.current = false;
              setDraggedItem(null);
            }, 100);
          };

          grid.on("dragstart", (event, element) => {
            const el = element as GridStackElement;
            const cardId = parseInt(el.getAttribute("data-id") || "0", 10);
            isDraggingRef.current = true;
            setDraggedItem({ cardId, originalStatusId: statusId });
          });

          grid.on("dragstop", (event, element) => {
            const el = element as GridStackElement;
            if (!el || !el.gridstackNode) return;
            const cardId = parseInt(el.getAttribute("data-id") || "0", 10);
            const newPosition = el.gridstackNode.y ?? 0;
            saveMovedCard(cardId, statusId, newPosition);
          });

          grid.on("dropped", (event, previousWidget, newWidget) => {
            if (!newWidget || !newWidget.el) return;
            const el = newWidget.el as GridStackElement;
            const cardId = parseInt(el.getAttribute("data-id") || "0", 10);
            const newPosition = newWidget.y ?? 0;
            saveMovedCard(cardId, statusId, newPosition);
          });
        }

        setTimeout(() => {
          const activeGrid = gridRefs.current[statusId];
          if (!activeGrid || !gridEl) return;
          
          activeGrid.batchUpdate();

          const items = gridEl.querySelectorAll(".cardpage-grid-item");
          items.forEach((item) => {
            if (item instanceof HTMLElement) {
              activeGrid.makeWidget(item);
            }
          });

          if (typeof activeGrid.compact === "function") {
            activeGrid.compact();
          }

          activeGrid.batchUpdate(false);
        }, 50);
      });
    }
  }, [restCardStore.cardsByStatus, forceRender, restStatusStore.statuses, restCardStore.startSavingCard]);

  useEffect(() => {
    const handleResize = () => setForceRender((prev) => prev + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isCardModalOpen && showChat) {
      setShowChat(false);
    }
  }, [isCardModalOpen]);

  const handleOpenCardModal = (card: CardDTO) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleCloseCardModal = () => {
    setIsCardModalOpen(false);
    setSelectedCard(null);
  };

  const handleQuickCreateCard = async (statusId: number, cardTitle: string) => {
    if (!cardTitle.trim()) return;
    if (isNaN(parsedBoardId)) return;

    await restCardStore.startSavingCard({
      id: 0,
      cardTitle: cardTitle.trim(),
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      priority: 1,
      position: 0,
      board_id: parsedBoardId,
      attachedLinks: "",
      status_id: statusId,
      prev_status_id: 0,
      users: [],
      finished: false,
      checklistItems: [],
      label: null,
    });
    await restCardStore.startLoadingCardsByBoardAndStatus(parsedBoardId, statusId);
  };

  const columnsWidth = columnsRef.current?.scrollWidth || 0;
  const maxWidth = showChat ? window.innerWidth * 0.75 : window.innerWidth;
  const useFull = columnsWidth <= maxWidth;

  useEffect(() => {
    if (!activeBoard && boards && boards.length > 0 && !isNaN(parsedBoardId)) {
      const found = boards.find(b => b.id === parsedBoardId);
      if (found) setActiveBoard(found);
    }
  }, [boards, parsedBoardId, activeBoard, setActiveBoard]);

  const swalDark = Swal.mixin({
    customClass: {
      popup: 'cardpage-swal-popup',
      title: 'cardpage-swal-title',
      htmlContainer: 'cardpage-swal-html-container',
      confirmButton: 'cardpage-swal-confirm-button',
      cancelButton: 'cardpage-swal-cancel-button',
      input: 'cardpage-swal-input',
    },
    background: '#2a2a2a',
    color: '#f0f0f0',
  });

  return (
    <>
      <Navbar />
      <Button
        variant="contained"
        color="primary"
        className="cardpage-chat-fab"
        onClick={e => {
          e.stopPropagation();
          setShowChat((prev) => !prev);
        }}
      >
        <span className="cardpage-chat-fab-icon">💬</span>
      </Button>
      <div className="cardpage-container">
        <div className="cardpage-header">
          <h1 className="cardpage-header-title cardpage-header-title-flex">
            <ArrowBackIcon
              sx={{ fontSize: 40, cursor: 'pointer', color: '#fff' }}
              onClick={() => navigate('/boards')}
            />
            {activeBoard ? (
              activeBoard.boardName
            ) : (
              <AccessTimeIcon sx={{ fontSize: 80, color: '#bdbdbd' }} />
            )}
          </h1>
          <button
            className="cardpage-add-status-button"
            onClick={async () => {
              const { value: nombre } = await swalDark.fire({
                title: 'Crear Nuevo Estado',
                input: 'text',
                inputPlaceholder: 'Nombre del nuevo estado',
                showCancelButton: true,
                confirmButtonText: 'Crear',
                cancelButtonText: 'Cancelar',
                inputValidator: (value) => {
                  if (!value || !value.trim()) {
                    return '¡El nombre no puede estar vacío!';
                  }
                }
              });

              if (nombre && nombre.trim()) {
                if (!parsedBoardId) return;
                await restStatusStore.createStatus({
                  name: nombre.trim(),
                  boardId: parsedBoardId
                });
              }
            }}
          >
            <span className="cardpage-icon-add-circle-box">
              <AddCircleIcon />
            </span>
          </button>
        </div>
        
        <div className="cardpage-columns-scrollbar-wrapper">
          <div
            className={`cardpage-columns-scrollbar cardpage-columns-scrollbar-dynamic${showChat ? ' cardpage-chat-open' : ''}`}
            ref={scrollbarRef}
          >
            <div className="cardpage-columns-scrollbar-inner" />
          </div>
          <div
            className={`cardpage-columns cardpage-columns-dynamic${showChat ? ' cardpage-chat-open' : ''}`}
            ref={columnsRef}
          >
            {restStatusStore.statuses.length === 0 ? (
              <div></div>
            ) : (
              restStatusStore.statuses.map((status) => {
                if (status.id === undefined) return null;
                const statusId = status.id;
                return (
                  <div key={statusId} className="cardpage-status-column">
                    <div className="cardpage-status-header">
                      <h2 className="cardpage-status-title">{status.name}</h2>
                      <div 
                        className="cardpage-status-menu" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(statusId);
                        }}
                      >
                        <MoreVertIcon className="cardpage-menu-icon" />
                        {openMenuId === statusId && (
                          <div 
                            ref={el => { menuRefs.current[statusId] = el; }}
                            className="cardpage-menu-dropdown"
                          >
                            <div
                              className="cardpage-menu-item"
                              onClick={async e => {
                                e.stopPropagation();
                                setOpenMenuId(null);

                                if (status.id === undefined) return;

                                const { value: newCardTitle } = await swalDark.fire({
                                  title: 'Crear nueva tarjeta',
                                  input: 'text',
                                  inputPlaceholder: 'Título de la nueva tarjeta',
                                  showCancelButton: true,
                                  confirmButtonText: 'Crear',
                                  cancelButtonText: 'Cancelar',
                                  inputValidator: (value) => {
                                    if (!value || !value.trim()) {
                                      return '¡El título no puede estar vacío!';
                                    }
                                  }
                                });

                                if (newCardTitle && newCardTitle.trim()) {
                                  if (isNaN(parsedBoardId)) return;
                                  await handleQuickCreateCard(status.id, newCardTitle.trim());
                                }
                              }}
                            >
                              <AddCircleIcon className="cardpage-menu-item-icon" />
                              <span>Crear</span>
                            </div>
                            <div
                              className="cardpage-menu-item"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (status.id === undefined) return;
                                
                                const { value: nuevoNombre } = await swalDark.fire({
                                  title: 'Editar Nombre del Estado',
                                  input: 'text',
                                  inputValue: status.name,
                                  inputPlaceholder: 'Nuevo nombre del estado',
                                  showCancelButton: true,
                                  confirmButtonText: 'Guardar',
                                  cancelButtonText: 'Cancelar',
                                  inputValidator: (value) => {
                                    if (!value || !value.trim()) {
                                      return '¡El nombre no puede estar vacío!';
                                    }
                                    if (value.trim() === status.name) {
                                      return 'El nombre es el mismo.';
                                    }
                                  }
                                });

                                if (nuevoNombre && nuevoNombre.trim() && nuevoNombre !== status.name) {
                                  await restStatusStore.modifyStatus({ ...status, name: nuevoNombre.trim() });
                                }
                                setOpenMenuId(null);
                              }}
                            >
                              <EditIcon className="cardpage-menu-item-icon" />
                              <span>Editar</span>
                            </div>
                            <div
                              className="cardpage-menu-item"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (status.id === undefined) return;

                                const result = await swalDark.fire({
                                  title: '¿Estás seguro que quieres eliminar el estado??',
                                  text: "¡Todas las tarjetas asociadas se eliminarán y no podrás revertir este cambio!",
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonText: 'Sí, ¡eliminar!',
                                  cancelButtonText: 'Cancelar',
                                  confirmButtonColor: '#d33',
                                  cancelButtonColor: '#3085d6'
                                });

                                if (result.isConfirmed) {
                                  await restStatusStore.removeStatus(status.id);
                                }
                                setOpenMenuId(null);
                              }}
                            >
                              <DeleteIcon className="cardpage-menu-item-icon" />
                              <span>Eliminar</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div id={`cardpage-custom-grid-${statusId}`} className="cardpage-grid-stack" gs-accept="true">
                      {restCardStore.cardsByStatus[statusId]
                        ?.slice()
                        .sort((a, b) => a.position - b.position)
                        .map((card) => (
                          <div key={card.id} className="cardpage-grid-item" gs-w="1" gs-h="1" data-id={card.id} gs-x="0" gs-y={card.position}>
                            <div className="cardpage-grid-item-content">
                              <CardItem card={card} onClick={handleOpenCardModal} />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <img
          src={LogoTaskor}
          alt=""
          className="centered-logo-bg"
          draggable={false}
        />
      </div>
      <CardModal
        isOpen={isCardModalOpen}
        closeModal={handleCloseCardModal}
        card={selectedCard}
        statuses={restStatusStore.statuses || []}
        checklistItems={selectedCard?.checklistItems ?? null}
        forceRender={() => setForceRender(f => f + 1)}
      />

      {showChat && (
        <div className="cardpage-chat-float-bg">
          <div
            className="cardpage-chat-float-panel"
            onClick={e => e.stopPropagation()}
          >
            <WebSocketChat boardId={parsedBoardId} onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}
    </>
  );
};