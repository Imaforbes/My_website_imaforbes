// src/pages/AdminExperiences.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import {
  LogOut,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Briefcase,
  Calendar,
  MapPin,
  Save,
  X,
  Filter,
  Archive,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"></div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>
  </div>
);

const AdminExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [experienceToDelete, setExperienceToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    period: "",
    description: "",
    responsibilities: [],
    technologies: [],
    sort_order: 0,
    status: "published",
  });
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newTechnology, setNewTechnology] = useState("");
  const navigate = useNavigate();

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const status = statusFilter !== "all" ? statusFilter : "all";
      const result = await api.experiences.getAll(status);
      
      // Debug logging (only in development)
      if (import.meta.env.DEV) {
        console.log('Admin Experiences API result:', result);
      }
      
      // Check if result is successful and has data
      if (result.success && result.data) {
        const apiResponse = result.data;
        
        // The API returns: { success: true, data: { success: true, data: [...] } }
        if (apiResponse.success && Array.isArray(apiResponse.data)) {
          const experiencesData = apiResponse.data;
          setExperiences(experiencesData.sort((a, b) => {
            if (a.sort_order !== b.sort_order) {
              return a.sort_order - b.sort_order;
            }
            return new Date(b.created_at) - new Date(a.created_at);
          }));
          return; // Success, exit early
        } else if (apiResponse.success && Array.isArray(apiResponse.data) && apiResponse.data.length === 0) {
          // Empty array is valid - no experiences yet
          setExperiences([]);
          return;
        }
      }
      
      // If we get here, API call didn't return expected format
      if (import.meta.env.DEV) {
        console.warn('Unexpected API response format:', result);
      }
      setError(result.error || result.message || "Failed to load work experiences");
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setError(error.message || "Failed to load work experiences");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleCreateNew = () => {
    setEditingExperience(null);
    setFormData({
      title: "",
      company: "",
      location: "",
      period: "",
      description: "",
      responsibilities: [],
      technologies: [],
      sort_order: 0,
      status: "published",
    });
    setNewResponsibility("");
    setNewTechnology("");
    setShowModal(true);
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);
    setFormData({
      title: experience.title || "",
      company: experience.company || "",
      location: experience.location || "",
      period: experience.period || "",
      description: experience.description || "",
      responsibilities: experience.responsibilities || [],
      technologies: experience.technologies || [],
      sort_order: experience.sort_order || 0,
      status: experience.status || "published",
    });
    setNewResponsibility("");
    setNewTechnology("");
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.title.trim() || !formData.company.trim() || !formData.period.trim()) {
        setError("Title, company, and period are required");
        return;
      }

      const experienceData = {
        ...formData,
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        technologies: formData.technologies.filter(t => t.trim()),
      };

      let result;
      if (editingExperience) {
        result = await api.experiences.update(editingExperience.id, experienceData);
      } else {
        result = await api.experiences.create(experienceData);
      }

      if (result.success) {
        setShowModal(false);
        fetchExperiences();
        setError(null);
      } else {
        setError(result.message || result.error || "Failed to save experience");
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      setError(error.message || "Failed to save experience");
    }
  };

  const handleDeleteClick = (experience) => {
    setExperienceToDelete(experience);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!experienceToDelete) return;

    try {
      const result = await api.experiences.delete(experienceToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setExperienceToDelete(null);
        fetchExperiences();
      } else {
        setError(result.message || "Failed to delete experience");
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
      setError(error.message || "Failed to delete experience");
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, newResponsibility.trim()],
      });
      setNewResponsibility("");
    }
  };

  const removeResponsibility = (index) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== index),
    });
  };

  const addTechnology = () => {
    if (newTechnology.trim()) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTechnology.trim()],
      });
      setNewTechnology("");
    }
  };

  const removeTechnology = (index) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((_, i) => i !== index),
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-2 sm:p-4 md:p-8">
        <HeroBackground />
        <div className="relative z-10 container mx-auto max-w-7xl">
          {/* Page Title Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => navigate("/admin")}
                  className="p-2 bg-gray-100 dark:bg-[#151515] hover:bg-gray-200 dark:hover:bg-[#202020] rounded-lg transition-colors"
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
                  Experiencias Laborales
                </motion.h1>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleCreateNew}
                  className="group flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs sm:text-sm font-light rounded-xl transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-100"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Plus size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Nueva Experiencia</span>
                  <span className="sm:hidden">Nueva</span>
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="group flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-light rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <LogOut size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span className="sm:hidden">Salir</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-sm font-light"
            >
              {error}
            </motion.div>
          )}

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 space-y-4 bg-white dark:bg-[#0f0f0f] rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-light">
                <Filter size={16} />
                <span className="font-medium">Estado:</span>
              </div>
              {["all", "published", "draft", "archived"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-light transition-colors ${
                    statusFilter === status
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-gray-100 dark:bg-[#151515] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#202020]"
                  }`}
                >
                  {status === "all"
                    ? "Todas"
                    : status === "published"
                    ? "Publicadas"
                    : status === "draft"
                    ? "Borradores"
                    : "Archivadas"}
                </button>
              ))}
            </div>

            {experiences.length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 font-light">
                Mostrando {experiences.length}{" "}
                {experiences.length === 1 ? "experiencia" : "experiencias"}
                {statusFilter !== "all" &&
                  ` (${statusFilter === "published" ? "Publicadas" : statusFilter === "draft" ? "Borradores" : "Archivadas"})`}
              </div>
            )}
          </motion.div>

          {/* Experiences List */}
          <div className="space-y-4">
            {experiences.length > 0 ? (
              experiences.map((exp) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {exp.status === "published" ? (
                          <Eye size={16} className="text-green-600 dark:text-green-400" />
                        ) : (
                          <EyeOff size={16} className="text-gray-500" />
                        )}
                        <h3 className="text-lg sm:text-xl font-light text-gray-900 dark:text-white">
                          {exp.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Briefcase size={14} />
                          <span>{exp.company}</span>
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{exp.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{exp.period}</span>
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-light line-clamp-2">
                          {exp.description}
                        </p>
                      )}
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {exp.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-light rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515] text-xs rounded-xl transition-colors font-light"
                      >
                        <Edit size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(exp)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-[#151515] text-xs rounded-xl transition-colors font-light"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center p-8 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-gray-800 font-light">
                No hay experiencias laborales aún. Crea tu primera experiencia.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white dark:bg-[#0f0f0f] rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white">
                  {editingExperience ? "Editar Experiencia" : "Nueva Experiencia"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Título del Puesto *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                    placeholder="Ej: Software Engineer"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                    placeholder="Ej: Hostal Altaista S.A DE C.V"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                    placeholder="Ej: Mexico City, MX"
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Período *
                  </label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                    placeholder="Ej: 2025 - Present"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none transition-all duration-300 font-light"
                    placeholder="Breve descripción del puesto..."
                  />
                </div>

                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Responsabilidades
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addResponsibility();
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                      placeholder="Agregar responsabilidad..."
                    />
                    <button
                      onClick={addResponsibility}
                      className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors font-light"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.responsibilities.map((resp, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                      >
                        <ArrowRight size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-light">
                          {resp}
                        </span>
                        <button
                          onClick={() => removeResponsibility(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Tecnologías
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTechnology();
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                      placeholder="Agregar tecnología..."
                    />
                    <button
                      onClick={addTechnology}
                      className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors font-light"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-light">
                          {tech}
                        </span>
                        <button
                          onClick={() => removeTechnology(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-light">
                    Números menores aparecen primero
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-100 dark:bg-[#151515] hover:bg-gray-200 dark:hover:bg-[#202020] rounded-xl transition-colors text-gray-900 dark:text-white font-light"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors text-white dark:text-gray-900 flex items-center gap-2 font-light"
                  >
                    <Save size={16} />
                    Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white dark:bg-[#0f0f0f] rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-sm w-full text-center border border-gray-200 dark:border-gray-800"
            >
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400 text-3xl sm:text-4xl md:text-5xl mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-light text-gray-900 dark:text-white mb-2">
                Confirmar Eliminación
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base font-light">
                ¿Estás seguro? Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setExperienceToDelete(null);
                  }}
                  className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl bg-gray-100 dark:bg-[#151515] hover:bg-gray-200 dark:hover:bg-[#202020] transition-colors font-light text-gray-900 dark:text-white text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 transition-colors font-light text-white text-sm sm:text-base order-1 sm:order-2"
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

export default AdminExperiences;

