// src/pages/AdminMensajes.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api.js";
// --> CAMBIO CLAVE: Se importan los iconos desde 'lucide-react' para mantener la consistencia del proyecto.
import {
  LogOut,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Phone,
  Copy,
  Check,
  Globe,
  Monitor,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Minimalist subtle background */}
    <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a]"></div>
  </div>
);

const AdminMensajes = () => {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);

  useEffect(() => {
    const fetchMensajes = async () => {
      try {
        // Use the correct API endpoint with proper error handling
        const baseURL = API_CONFIG.getBaseURL();

        const response = await fetch(`${baseURL}/api/messages.php`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("API Response Status:", response.status);
        console.log("API Response Headers:", response.headers);

        if (response.status === 401 || response.status === 403) {
          console.error("AdminMensajes: Authentication failed - redirecting to login");
          console.error("Response status:", response.status);
          const errorText = await response.text();
          console.error("Error response:", errorText);
          navigate("/login");
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("API Response Data:", data);

        if (data.success && data.data) {
          // Handle the new API response format with items and pagination
          let messages = [];
          if (data.data.items) {
            messages = data.data.items;
          } else {
            messages = data.data;
          }
          // Sort messages by ID in descending order (newest first)
          messages.sort((a, b) => parseInt(b.id) - parseInt(a.id));
          setMensajes(messages);
        } else if (data.error) {
          console.error("API returned error:", data.error);
          if (
            data.error.includes("Access denied") ||
            data.error.includes("login")
          ) {
            navigate("/login");
          } else {
            setError(data.error);
          }
        } else {
          console.log("No data field in response, using raw data");
          setMensajes(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMensajes();
  }, [navigate]);

  const handleLogout = async () => {
    const baseURL = import.meta.env.PROD
      ? "https://www.imaforbes.com/api_db"
      : "API_CONFIG.getBaseURL()";

    await fetch(`${baseURL}/logout.php`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  const handleDeleteClick = (id) => {
    setMessageToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    try {
      const baseURL = API_CONFIG.getBaseURL();

      // First, get the CSRF token
      const tokenResponse = await fetch(
        `${baseURL}/api/auth/csrf-token.php`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      let csrfToken = null;
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData.success && tokenData.data?.csrf_token) {
          csrfToken = tokenData.data.csrf_token;
        }
      }

      // Now make the DELETE request with CSRF token
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const response = await fetch(
        `${baseURL}/api/messages.php?id=${messageToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: headers,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setMensajes((current) =>
          current.filter((m) => m.id !== messageToDelete)
        );
      } else {
        alert(`Error al eliminar: ${result.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error de conexión.");
    } finally {
      setShowConfirmModal(false);
      setMessageToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setMessageToDelete(null);
  };

  const copyToClipboard = async (text, itemId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-gray-900 dark:text-white">
        <p className="font-light">Cargando mensajes...</p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-red-600 dark:text-red-400">
        <p className="font-light">Error: {error}</p>
      </div>
    );

  return (
    <>
      <div className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-2 sm:p-4 md:p-8">
        <HeroBackground />
        <div className="relative z-10 container mx-auto max-w-7xl">
          {/* Page Title Section - More Prominent */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => navigate("/admin")}
                  className="p-2 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#151515] rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                </motion.button>
                <motion.h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight text-gray-900 dark:text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Bandeja de Entrada
                </motion.h1>
              </div>

              <motion.button
                onClick={handleLogout}
                className="group flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm font-light rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-[#151515]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <LogOut size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </motion.button>
            </div>
          </div>

          {/* Contact Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 bg-white dark:bg-[#0f0f0f] rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User size={20} className="text-gray-700 dark:text-gray-300" />
                  <span className="text-lg font-light text-gray-900 dark:text-white">
                    {mensajes.length}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-light">Total Contactos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mail size={20} className="text-gray-700 dark:text-gray-300" />
                  <span className="text-lg font-light text-gray-900 dark:text-white">
                    {
                      mensajes.filter((m) => !m.status || m.status === "new")
                        .length
                    }
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-light">Mensajes Nuevos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar size={20} className="text-gray-700 dark:text-gray-300" />
                  <span className="text-lg font-light text-gray-900 dark:text-white">
                    {mensajes.length > 0
                      ? formatDate(
                          mensajes.sort(
                            (a, b) =>
                              new Date(b.created_at || b.fecha) -
                              new Date(a.created_at || a.fecha)
                          )[0].created_at || mensajes[0].fecha
                        )
                      : "N/A"}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-light">Último Contacto</p>
              </div>
            </div>
          </motion.div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-[#0f0f0f] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">
                    ID
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-400">
                    Fecha
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-400">
                    Nombre
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-400">
                    Email
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-400">
                    Mensaje
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-400">
                    IP / Navegador
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {mensajes.length > 0 ? (
                  mensajes.map((mensaje) => (
                    <tr
                      key={mensaje.id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors"
                    >
                      <td className="p-4 whitespace-nowrap text-gray-600 dark:text-gray-400 font-light">
                        #{mensaje.id}
                      </td>
                      <td className="p-4 whitespace-nowrap text-gray-600 dark:text-gray-400 font-light">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-500 dark:text-gray-500" />
                          <span className="text-xs">
                            {formatDate(mensaje.created_at || mensaje.fecha)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500 dark:text-gray-500" />
                          <span className="font-light text-gray-900 dark:text-white">
                            {mensaje.name || mensaje.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-500 dark:text-gray-500" />
                          <a
                            href={`mailto:${mensaje.email}`}
                            className="text-gray-900 dark:text-white hover:underline text-sm font-light"
                          >
                            {mensaje.email}
                          </a>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                mensaje.email,
                                `email-${mensaje.id}`
                              )
                            }
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Copiar email"
                          >
                            {copiedItem === `email-${mensaje.id}` ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words font-light">
                        <div className="flex items-start gap-2">
                          <MessageSquare
                            size={16}
                            className="text-gray-500 dark:text-gray-500 mt-0.5 flex-shrink-0"
                          />
                          <span className="text-sm">
                            {mensaje.message || mensaje.mensaje}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs text-gray-600 dark:text-gray-400 font-light">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-gray-500 dark:text-gray-500" />
                            <span className="text-xs font-mono">
                              {mensaje.ip_address || "N/A"}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  mensaje.ip_address || "N/A",
                                  `ip-${mensaje.id}`
                                )
                              }
                              className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                              title="Copiar IP"
                            >
                              {copiedItem === `ip-${mensaje.id}` ? (
                                <Check size={12} />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          {mensaje.user_agent && (
                            <div className="flex items-start gap-2">
                              <Monitor
                                size={12}
                                className="text-gray-500 dark:text-gray-500 mt-0.5 flex-shrink-0"
                              />
                              <span
                                className="text-xs truncate"
                                title={mensaje.user_agent}
                              >
                                {mensaje.user_agent.length > 30
                                  ? `${mensaje.user_agent.substring(0, 30)}...`
                                  : mensaje.user_agent}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${mensaje.name || mensaje.nombre} - ${
                                  mensaje.email
                                } - ${mensaje.message || mensaje.mensaje}`,
                                `full-${mensaje.id}`
                              )
                            }
                            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Copiar información completa"
                          >
                            {copiedItem === `full-${mensaje.id}` ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(mensaje.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            title="Eliminar mensaje"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-8 text-gray-600 dark:text-gray-400 font-light">
                      Aún no has recibido ningún mensaje.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {mensajes.length > 0 ? (
              mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className="bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={16} className="text-gray-500 dark:text-gray-500" />
                        <h3 className="text-gray-900 dark:text-white font-light text-sm sm:text-base truncate">
                          {mensaje.name || mensaje.nombre}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs font-light">
                        <Calendar size={12} />
                        <span>
                          #{mensaje.id} •{" "}
                          {formatDate(mensaje.created_at || mensaje.fecha)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${mensaje.name || mensaje.nombre} - ${
                              mensaje.email
                            } - ${mensaje.message || mensaje.mensaje}`,
                            `full-${mensaje.id}`
                          )
                        }
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
                        title="Copiar información completa"
                      >
                        {copiedItem === `full-${mensaje.id}` ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(mensaje.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1"
                        title="Eliminar mensaje"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail
                        size={16}
                        className="text-gray-500 dark:text-gray-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-light">
                          Email de contacto:
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${mensaje.email}`}
                            className="text-gray-900 dark:text-white hover:underline text-xs sm:text-sm break-all font-light"
                          >
                            {mensaje.email}
                          </a>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                mensaje.email,
                                `email-${mensaje.id}`
                              )
                            }
                            className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Copiar email"
                          >
                            {copiedItem === `email-${mensaje.id}` ? (
                              <Check size={12} />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MessageSquare
                        size={16}
                        className="text-gray-500 dark:text-gray-500 flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-light">Mensaje:</p>
                        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-pre-wrap break-words font-light">
                          {mensaje.message || mensaje.mensaje}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe
                        size={16}
                        className="text-gray-500 dark:text-gray-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-light">
                          IP Address:
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 dark:text-gray-300 text-xs font-mono font-light">
                            {mensaje.ip_address || "N/A"}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                mensaje.ip_address || "N/A",
                                `ip-${mensaje.id}`
                              )
                            }
                            className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Copiar IP"
                          >
                            {copiedItem === `ip-${mensaje.id}` ? (
                              <Check size={12} />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {mensaje.user_agent && (
                      <div className="flex items-start gap-2">
                        <Monitor
                          size={16}
                          className="text-gray-500 dark:text-gray-500 flex-shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 font-light">
                            Navegador:
                          </p>
                          <p
                            className="text-gray-700 dark:text-gray-300 text-xs break-words font-light"
                            title={mensaje.user_agent}
                          >
                            {mensaje.user_agent.length > 50
                              ? `${mensaje.user_agent.substring(0, 50)}...`
                              : mensaje.user_agent}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-gray-800 font-light">
                Aún no has recibido ningún mensaje.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white dark:bg-[#0f0f0f] rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-sm w-full text-center border border-gray-200 dark:border-gray-800"
            >
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400 text-3xl sm:text-4xl md:text-5xl mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-light mb-2 text-gray-900 dark:text-white">
                Confirmar Eliminación
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base font-light">
                ¿Estás seguro? Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors font-light text-gray-900 dark:text-white text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-light text-sm sm:text-base order-1 sm:order-2"
                >
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminMensajes;
