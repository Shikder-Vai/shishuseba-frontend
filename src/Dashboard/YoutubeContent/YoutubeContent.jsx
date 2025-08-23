import React, { useState } from 'react';
import { 
  Youtube, 
  Save, 
  Trash2, 
  X, 
  Loader2,
  Play,
  Plus,
  ChevronRight,
  ChevronLeft,
  Edit
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const YoutubeContent = () => {
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);
  const [editUrl, setEditUrl] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: -50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const { data: videos = [], isLoading, isError } = useQuery({
    queryKey: ['youtubeVideos'],
    queryFn: async () => {
      const response = await axiosPublic.get('/youtube');
      return response.data.videos || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, url }) => 
      axiosPublic.put(`/youtube/${id}`, { url }),
    onSuccess: () => {
      queryClient.invalidateQueries(['youtubeVideos']);
      setIsEditModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Video updated successfully',
        showConfirmButton: false,
        timer: 1500,
        background: '#f0fdf4',
        iconColor: '#10b981'
      });
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update video',
        background: '#fef2f2',
        iconColor: '#ef4444'
      });
    }
  });

  const addMutation = useMutation({
    mutationFn: (url) => 
      axiosPublic.post('/youtube', { url }),
    onSuccess: () => {
      queryClient.invalidateQueries(['youtubeVideos']);
      setIsAddModalOpen(false);
      setNewVideoUrl('');
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'New video added successfully',
        showConfirmButton: false,
        timer: 1500,
        background: '#f0fdf4',
        iconColor: '#10b981'
      });
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add video',
        background: '#fef2f2',
        iconColor: '#ef4444'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => 
      axiosPublic.delete(`/youtube/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['youtubeVideos']);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Video removed successfully',
        showConfirmButton: false,
        timer: 1500,
        background: '#f0fdf4',
        iconColor: '#10b981'
      });
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete video',
        background: '#fef2f2',
        iconColor: '#ef4444'
      });
    }
  });

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const validateYouTubeUrl = (url) => {
    if (!url) return true;
    return getYouTubeId(url) !== null;
  };

  const handleEditClick = (video) => {
    setEditingVideo(video);
    setEditUrl(video.url);
    setIsEditModalOpen(true);
  };

  const handleUpdateVideo = () => {
    if (!validateYouTubeUrl(editUrl)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid URL',
        text: 'Please enter a valid YouTube URL',
        background: '#fef2f2',
        iconColor: '#ef4444'
      });
      return;
    }
    updateMutation.mutate({ id: editingVideo._id, url: editUrl });
  };

  const handleAddVideo = () => {
    if (!validateYouTubeUrl(newVideoUrl)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid URL',
        text: 'Please enter a valid YouTube URL',
        background: '#fef2f2',
        iconColor: '#ef4444'
      });
      return;
    }
    addMutation.mutate(newVideoUrl);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      background: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const nextVideo = () => {
    if (videos.length === 0) return;
    const currentIndex = videos.findIndex(v => v._id === activeVideoId);
    const nextIndex = (currentIndex + 1) % videos.length;
    setActiveVideoId(videos[nextIndex]._id);
  };

  const prevVideo = () => {
    if (videos.length === 0) return;
    const currentIndex = videos.findIndex(v => v._id === activeVideoId);
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    setActiveVideoId(videos[prevIndex]._id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-red-500">
        Failed to load videos. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Add Video Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Plus className="mr-2 text-red-600" /> Add New Video
              </h2>
              <input
                type="text"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="Paste YouTube URL here"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVideo}
                  disabled={addMutation.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 flex items-center"
                >
                  {addMutation.isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" /> Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" /> Add Video
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Video Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Edit className="mr-2 text-green-600" /> Update Video
              </h2>
              <input
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="Enter new YouTube URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateVideo}
                  disabled={updateMutation.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center"
                >
                  {updateMutation.isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" /> Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" /> Update Video
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Youtube size={36} className="text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">YouTube Content Manager</h1>
                <p className="text-red-100">Add and manage YouTube videos for your website</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <Plus className="mr-2" size={18} /> Add Video
            </button>
          </div>
        </div>

        <div className="p-5 md:p-6">
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <Youtube size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Videos Added Yet</h3>
              <p className="text-gray-500 mb-6">Click the "Add Video" button to add your first YouTube video</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition mx-auto"
              >
                <Plus className="mr-2" /> Add Video
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {videos.map((video) => {
                  const videoId = getYouTubeId(video.url);
                  const isActive = activeVideoId === video._id;
                  
                  return (
                    <div 
                      key={video._id}
                      className={`border rounded-xl p-4 transition-all duration-300 ${
                        'border-gray-200'
                      } ${isActive ? 'ring-2 ring-red-500' : ''}`}
                      onClick={() => setActiveVideoId(video._id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                            <Play size={16} className="text-red-600" />
                          </div>
                          <h3 className="font-medium text-gray-700">Video {videos.indexOf(video) + 1}</h3>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(video._id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete video"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="mb-3 flex gap-2">
                        <input
                          type="text"
                          value={video.url}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(video);
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                      
                      {videoId ? (
                        <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-100 border">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`YouTube video ${video._id}`}
                          />
                        </div>
                      ) : (
                        <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-100 border">
                          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center p-4 text-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                              <div className="text-gray-500">
                                <Youtube size={32} className="mx-auto mb-2" />
                                <p>Enter YouTube URL to preview</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {videos.length > 0 && (
                <div className="flex justify-center mb-8">
                  <div className="flex items-center bg-gray-100 rounded-full p-1">
                    <button
                      onClick={prevVideo}
                      className="p-2 rounded-full hover:bg-gray-200"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="mx-4 text-gray-700">
                      {activeVideoId 
                        ? `Video ${videos.findIndex(v => v._id === activeVideoId) + 1} of ${videos.length}`
                        : `1 of ${videos.length}`}
                    </div>
                    <button
                      onClick={nextVideo}
                      className="p-2 rounded-full hover:bg-gray-200"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
       {/* Add More Videos Button */}
      <div className="flex justify-center mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <Plus className="mr-2" />
          Add More Videos
        </motion.button>
      </div>

      {/* Instructions Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
          <Youtube className="mr-2 text-red-600" size={24} />
          How to Manage Videos
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="bg-red-100 text-red-600 rounded-full p-1 mr-3">
              <Plus size={16} />
            </span>
            <span>Click "Add More Videos" to add new YouTube links</span>
          </li>
          <li className="flex items-start">
            <span className="bg-green-100 text-green-600 rounded-full p-1 mr-3">
              <Edit size={16} />
            </span>
            <span>Click the green update button to edit existing videos</span>
          </li>
          <li className="flex items-start">
            <span className="bg-red-100 text-red-600 rounded-full p-1 mr-3">
              <Trash2 size={16} />
            </span>
            <span>Click the trash icon to delete videos</span>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3">
              <Play size={16} />
            </span>
            <span>Click on any video card to preview it</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default YoutubeContent;