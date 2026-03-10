// src/pages/AdminBlog.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api.js";
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
  FileText,
  Mail,
  Calendar,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Loader,
  Heart,
  Filter,
  FileEdit,
  Archive,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageCropper from "../components/ImageCropper";

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    {/* Minimalist subtle background */}
    <div className="absolute inset-0 bg-gray-50 dark:bg-[#0a0a0a]"></div>
  </div>
);

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'draft', 'published', 'archived'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'poem', 'letter'
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    type: "poem",
    status: "draft",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [fileToCrop, setFileToCrop] = useState(null);
  const navigate = useNavigate();

  // Helper function to build image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If it's a full URL (starts with http/https), use it directly
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it's a relative path, prepend the API base URL
    const baseUrl = API_CONFIG.getBaseURL();
    // Ensure the path starts with / and doesn't have double slashes
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, typeFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Apply filters: typeFilter can be 'all', 'poem', or 'letter'
      // statusFilter can be 'all', 'draft', 'published', or 'archived'
      const type = typeFilter !== "all" ? typeFilter : null;
      const status = statusFilter !== "all" ? statusFilter : "all";
      const result = await api.blog.getAll(type, status);
      
      if (result.success && result.data?.success) {
        const postsData = result.data.data || [];
        setPosts(postsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } else {
        setError("Failed to load blog posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const baseURL = API_CONFIG.getBaseURL();
    await fetch(`${baseURL}/api/auth/logout.php`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  const handleCreateNew = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      content: "",
      image_url: "",
      type: "poem",
      status: "draft",
    });
    setSelectedFile(null);
    setUploadError(null);
    setImageError(false);
    setShowModal(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      content: post.content || "",
      image_url: post.image_url || "",
      type: post.type || "poem",
      status: post.status || "draft",
    });
    setSelectedFile(null);
    setUploadError(null);
    setImageError(false); // Reset image error state when editing
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG, GIF y WebP.');
        return;
      }
      
      // Validate file size (20MB for high resolution images)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        setUploadError('El archivo es demasiado grande. Tamaño máximo: 20MB.');
        return;
      }

      // Check if user wants to skip cropping (hold Shift key)
      const skipCropping = e.nativeEvent.shiftKey;
      
      if (skipCropping) {
        // Use original file without cropping
        setSelectedFile(file);
        setUploadError(null);
      } else {
        // Show cropper for positioning
        setFileToCrop(file);
        setShowCropper(true);
        setUploadError(null);
      }
    }
  };

  const handleCropComplete = (croppedFile) => {
    setSelectedFile(croppedFile);
    setShowCropper(false);
    setFileToCrop(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setFileToCrop(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      setUploadError('Por favor selecciona un archivo');
      return;
    }

    try {
      setUploadingImage(true);
      setUploadError(null);

      const result = await api.upload.image(selectedFile);
      
      if (result.success && result.data) {
        // The API returns: { success: true, data: { url: "...", filename: "...", ... } }
        // apiService wraps it, so result.data contains the API response
        const apiResponse = result.data;
        
        // Check if the response has nested data structure
        let imageData;
        if (apiResponse.success && apiResponse.data) {
          // Nested structure: { success: true, data: { url: "...", ... } }
          imageData = apiResponse.data;
        } else if (apiResponse.url) {
          // Direct structure: { url: "...", filename: "...", ... }
          imageData = apiResponse;
        }
        
        if (imageData && imageData.url) {
          // Extract just the path portion if it's a full URL
          // Store relative path for consistency (e.g., /uploads/images/filename.jpg)
          let imagePath = imageData.url;
          
          // If it's a full URL, extract the relative path
          if (imagePath.includes('/uploads/')) {
            const uploadsIndex = imagePath.indexOf('/uploads/');
            imagePath = imagePath.substring(uploadsIndex);
          }
          
          setFormData({ ...formData, image_url: imagePath });
          setSelectedFile(null);
          setUploadError(null);
        } else {
          setUploadError('La imagen se subió pero no se recibió la URL correctamente');
        }
      } else {
        const errorMsg = result.error || result.data?.message || 'Error al subir la imagen';
        setUploadError(errorMsg);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Error al subir la imagen: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      // Client-side validation
      const title = formData.title.trim();
      const content = formData.content.trim();
      
      if (!title || !content) {
        alert("El título y el contenido son requeridos");
        return;
      }
      
      // Validate length before sending
      if (title.length < 2 || title.length > 200) {
        alert("El título debe tener entre 2 y 200 caracteres");
        return;
      }
      
      if (content.length < 10 || content.length > 50000) {
        alert("El contenido debe tener entre 10 y 50000 caracteres");
        return;
      }

      // Prepare data for API
      const dataToSend = {
        title: title,
        content: content,
        type: formData.type || 'poem',
        status: formData.status || 'draft',
      };
      
      // Only include image_url if it's not empty
      if (formData.image_url && formData.image_url.trim()) {
        dataToSend.image_url = formData.image_url.trim();
      }

      let result;
      if (editingPost) {
        result = await api.blog.update(editingPost.id, dataToSend);
      } else {
        result = await api.blog.create(dataToSend);
      }

      // Log response in development mode
      if (import.meta.env.DEV) {
        console.log('Blog save response:', result);
      }

      // Handle response
      // Check if result is successful (either result.success or result.data?.success)
      const isSuccess = result.success && (result.data?.success !== false);
      
      if (isSuccess) {
        setShowModal(false);
        // Reset form
        setFormData({
          title: "",
          content: "",
          image_url: "",
          type: "poem",
          status: "draft",
        });
        setSelectedFile(null);
        setImageError(false);
        fetchPosts();
      } else {
        // Show validation errors if available
        if (result.errors && Object.keys(result.errors).length > 0) {
          const errorMessages = Object.values(result.errors).join('\n');
          alert(`Error de validación:\n${errorMessages}`);
        } else if (result.data?.errors && Object.keys(result.data.errors).length > 0) {
          // Check nested errors structure
          const errorMessages = Object.values(result.data.errors).join('\n');
          alert(`Error de validación:\n${errorMessages}`);
        } else {
          const errorMsg = result.data?.message || result.error || result.message || "Error desconocido";
          alert(`Error: ${errorMsg}`);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error saving post:", error);
      }
      alert("Error al guardar el post. Por favor, intenta de nuevo.");
    }
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      const result = await api.blog.delete(postToDelete.id);
      if (result.success && result.data?.success) {
        setPosts(posts.filter((p) => p.id !== postToDelete.id));
      } else {
        alert(`Error: ${result.data?.message || result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting post");
    } finally {
      setShowDeleteModal(false);
      setPostToDelete(null);
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
        <p className="font-light">Cargando posts...</p>
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
                  Mi Blog
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
                  <span className="hidden sm:inline">Nuevo Post</span>
                  <span className="sm:hidden">Nuevo</span>
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="group flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm font-light rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-[#151515]"
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

            {/* Filters Section */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 space-y-4"
            >
              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Filter size={16} />
                  <span className="font-light">Estado:</span>
                </div>
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 ${
                    statusFilter === "all"
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515]"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter("published")}
                  className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 flex items-center gap-2 ${
                    statusFilter === "published"
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515]"
                  }`}
                >
                  <CheckCircle size={14} />
                  Publicados
                </button>
                <button
                  onClick={() => setStatusFilter("draft")}
                  className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 flex items-center gap-2 ${
                    statusFilter === "draft"
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515]"
                  }`}
                >
                  <FileEdit size={14} />
                  Borradores
                </button>
                <button
                  onClick={() => setStatusFilter("archived")}
                  className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 flex items-center gap-2 ${
                    statusFilter === "archived"
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515]"
                  }`}
                >
                  <Archive size={14} />
                  Archivados
                </button>
              </div>

              {/* Type Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Filter size={16} />
                  <span className="font-light">Tipo:</span>
                </div>
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 ${
                    typeFilter === "all"
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515]"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTypeFilter("poem")}
                  className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 flex items-center gap-2 ${
                    typeFilter === "poem"
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515]"
                  }`}
                >
                  <FileText size={14} />
                  Poemas
                </button>
                <button
                  onClick={() => setTypeFilter("letter")}
                  className={`px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 flex items-center gap-2 ${
                    typeFilter === "letter"
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515]"
                  }`}
                >
                  <Mail size={14} />
                  Cartas
                </button>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600 dark:text-gray-400 font-light">
                {posts.length > 0 ? (
                  <>
                    Mostrando {posts.length} {posts.length === 1 ? "post" : "posts"}
                    {statusFilter !== "all" && ` (${statusFilter === "published" ? "publicados" : statusFilter === "draft" ? "borradores" : "archivados"})`}
                    {typeFilter !== "all" && ` - ${typeFilter === "poem" ? "Poemas" : "Cartas"}`}
                  </>
                ) : (
                  <span>No hay posts con estos filtros</span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 sm:p-6 space-y-4"
                >
                  {/* Blog Image Preview */}
                  {post.image_url && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(post.image_url)}
                        alt={post.title}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.type === "poem" ? (
                          <FileText size={16} className="text-gray-500 dark:text-gray-500" />
                        ) : (
                          <Mail size={16} className="text-gray-500 dark:text-gray-500" />
                        )}
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-full text-gray-700 dark:text-gray-300 font-light">
                          {post.type === "poem" ? "Poema" : "Carta"}
                        </span>
                        {post.status === "published" ? (
                          <Eye size={14} className="text-gray-500 dark:text-gray-500" />
                        ) : (
                          <EyeOff size={14} className="text-gray-400 dark:text-gray-600" />
                        )}
                      </div>
                      <h3 className="text-lg font-light text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs flex items-center gap-1 mb-2 font-light">
                        <Calendar size={12} />
                        {formatDate(post.created_at)}
                      </p>
                      {/* Blog Statistics */}
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs font-light">
                          <Eye size={12} />
                          <span>{post.views_count || 0} vistas</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs font-light">
                          <Heart size={12} />
                          <span>{post.likes_count || 0} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-4 whitespace-pre-wrap font-light">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => handleEdit(post)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515] text-xs rounded-xl transition-colors font-light"
                    >
                      <Edit size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(post)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-[#151515] text-xs rounded-xl transition-colors font-light"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center p-8 text-gray-600 dark:text-gray-400 bg-white dark:bg-[#0f0f0f] rounded-xl border border-gray-200 dark:border-gray-800 font-light">
                No hay posts aún. Crea tu primer poema o carta.
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
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm"
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
                  {editingPost ? "Editar Post" : "Nuevo Post"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                    placeholder="Título del poema o carta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                  >
                    <option value="poem">Poema</option>
                    <option value="letter">Carta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Contenido
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={12}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-none whitespace-pre-wrap transition-all duration-300 font-light"
                    placeholder="Escribe tu poema o carta aquí..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Imagen (Opcional)
                  </label>
                  
                  {/* File Upload Section */}
                  <div className="space-y-3 mb-3">
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors duration-200 font-light">
                          <Upload size={18} />
                          <span className="text-sm">
                            {selectedFile ? selectedFile.name : "Seleccionar imagen"}
                          </span>
                        </div>
                      </label>
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={handleUploadImage}
                          disabled={uploadingImage}
                          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-colors duration-200 flex items-center gap-2 font-light"
                        >
                          {uploadingImage ? (
                            <>
                              <Loader size={18} className="animate-spin" />
                              <span>Subiendo...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={18} />
                              <span>Subir</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Upload Error */}
                    {uploadError && (
                      <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-light">
                        {uploadError}
                      </div>
                    )}

                    {/* Selected File Info and Preview */}
                    {selectedFile && !uploadingImage && (
                      <div className="space-y-2">
                        <div className="px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-xs font-light">
                          Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                        {/* Preview of selected file */}
                        <div className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            className="w-full h-40 object-contain bg-gray-50 dark:bg-[#0a0a0a]"
                            onError={() => setImageError(true)}
                            onLoad={() => setImageError(false)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-light">o</span>
                      <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
                    </div>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImageError(false); // Reset error when URL changes
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all duration-300 font-light"
                      placeholder="Pega una URL de imagen o ruta (/uploads/...)"
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.image_url && (
                    <div className="mt-3">
                      <div className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 min-h-[10rem]">
                        {imageError ? (
                          // SECURITY: Use React-safe text rendering instead of innerHTML
                          <div className="w-full h-40 bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center text-gray-600 dark:text-gray-400 text-sm font-light">
                            Imagen no disponible
                          </div>
                        ) : (
                          <img
                            src={getImageUrl(formData.image_url)}
                            alt="Preview"
                            className="w-full h-40 object-contain bg-gray-50 dark:bg-[#0a0a0a]"
                            onError={() => setImageError(true)}
                            onLoad={() => setImageError(false)}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image_url: "" });
                            setImageError(false);
                          }}
                          className="absolute top-2 right-2 p-1 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-[#151515] rounded-full transition-colors"
                          title="Eliminar imagen"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-light">
                    Sube una imagen desde tu PC o pega una URL. Formatos: JPEG, PNG, GIF, WebP (máx. 20MB)
                    <br />
                    <span className="text-gray-500 dark:text-gray-500 italic">
                      💡 Mantén presionada la tecla Shift al seleccionar para subir sin recortar (resolución original)
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-light">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
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
                    className="px-6 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#151515] rounded-xl transition-colors font-light"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2 font-light"
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
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                  }}
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

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {showCropper && fileToCrop && (
          <ImageCropper
            imageFile={fileToCrop}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminBlog;

