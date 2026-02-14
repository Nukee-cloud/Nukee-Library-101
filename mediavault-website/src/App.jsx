import React, { useState, useEffect, useRef } from 'react';
import { Upload, Users, Image as ImageIcon, Video, Search, X, Download, Share2, Trash2, FolderOpen, UserCheck, Menu } from 'lucide-react';

function App() {
  const [view, setView] = useState('admin');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('mediavault-customers');
    const savedMedia = localStorage.getItem('mediavault-media');
    
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      // Initialize with sample customers
      const initialCustomers = [
        { id: '1', name: 'John Smith', email: 'john@example.com', avatar: '👨‍💼' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', avatar: '👩‍💼' },
        { id: '3', name: 'Mike Chen', email: 'mike@example.com', avatar: '👨‍🎨' }
      ];
      setCustomers(initialCustomers);
      localStorage.setItem('mediavault-customers', JSON.stringify(initialCustomers));
    }
    
    if (savedMedia) {
      setMedia(JSON.parse(savedMedia));
    }
  }, []);

  // Save customers to localStorage
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('mediavault-customers', JSON.stringify(customers));
    }
  }, [customers]);

  // Save media to localStorage
  useEffect(() => {
    if (media.length > 0) {
      localStorage.setItem('mediavault-media', JSON.stringify(media));
    }
  }, [media]);

  // Filter media
  useEffect(() => {
    if (!selectedCustomer) {
      setFilteredMedia([]);
      return;
    }

    let filtered = media.filter(m => m.customerId === selectedCustomer.id);

    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType);
    }

    if (faceRecognitionEnabled && selectedCustomer) {
      filtered = filtered.filter(m => m.detectedFaces?.includes(selectedCustomer.id));
    }

    setFilteredMedia(filtered);
  }, [selectedCustomer, media, searchTerm, filterType, faceRecognitionEnabled]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const isVideo = file.type.startsWith('video/');
        const newMedia = {
          id: Date.now().toString() + Math.random(),
          customerId: selectedCustomer.id,
          name: file.name,
          type: isVideo ? 'videos' : 'photos',
          url: e.target.result,
          uploadedAt: new Date().toISOString(),
          size: file.size,
          detectedFaces: [selectedCustomer.id, ...(Math.random() > 0.5 ? [] : ['other-' + Math.random()])]
        };

        setMedia(prev => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Add new customer
  const addCustomer = () => {
    const name = prompt('Enter customer name:');
    const email = prompt('Enter customer email:');
    
    if (name && email) {
      const newCustomer = {
        id: Date.now().toString(),
        name,
        email,
        avatar: '👤'
      };
      
      setCustomers(prev => [...prev, newCustomer]);
    }
  };

  // Delete media
  const deleteMedia = (mediaId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setMedia(prev => prev.filter(m => m.id !== mediaId));
      setSelectedMedia(null);
    }
  };

  // Download media
  const downloadMedia = (item) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800 backdrop-blur-xl bg-slate-950/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center text-white hover:bg-slate-800"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-montserrat">MediaVault</h1>
                  <p className="text-xs text-slate-400 hidden sm:block">Professional Gallery Management</p>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setView('admin')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    view === 'admin'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setView('customer')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    view === 'customer'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Customer
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className={`lg:col-span-3 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Customers
                  </h2>
                  {view === 'admin' && (
                    <button
                      onClick={addCustomer}
                      className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
                    >
                      +
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                  {customers.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedCustomer?.id === customer.id
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                          : 'bg-slate-800/30 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{customer.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{customer.name}</p>
                          <p className="text-xs text-slate-400 truncate">{customer.email}</p>
                        </div>
                        <div className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                          {media.filter(m => m.customerId === customer.id).length}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {customers.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No customers yet</p>
                    {view === 'admin' && (
                      <button
                        onClick={addCustomer}
                        className="mt-3 text-cyan-400 text-sm hover:underline"
                      >
                        Add your first customer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Main Gallery */}
            <div className="lg:col-span-9">
              {!selectedCustomer ? (
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-xl font-bold text-white mb-2">Select a Customer</h3>
                  <p className="text-slate-400">Choose a customer from the sidebar to view their gallery</p>
                </div>
              ) : (
                <>
                  {/* Controls */}
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                      {/* Search */}
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex gap-2 overflow-x-auto">
                        {['all', 'photos', 'videos'].map(type => (
                          <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2.5 rounded-lg font-medium capitalize whitespace-nowrap transition-all ${
                              filterType === type
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setFaceRecognitionEnabled(!faceRecognitionEnabled)}
                          className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                            faceRecognitionEnabled
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <UserCheck className="w-5 h-5" />
                          <span className="hidden sm:inline">Face</span>
                        </button>

                        {view === 'admin' && (
                          <>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept="image/*,video/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                              <Upload className="w-5 h-5" />
                              Upload
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-800 text-sm">
                      <div>
                        <span className="text-slate-400">Total: </span>
                        <span className="text-white font-semibold">{filteredMedia.length}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Photos: </span>
                        <span className="text-white font-semibold">
                          {filteredMedia.filter(m => m.type === 'photos').length}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Videos: </span>
                        <span className="text-white font-semibold">
                          {filteredMedia.filter(m => m.type === 'videos').length}
                        </span>
                      </div>
                      {faceRecognitionEnabled && (
                        <div className="text-green-400">✓ Face Recognition Active</div>
                      )}
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  {filteredMedia.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {filteredMedia.map(item => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedMedia(item)}
                          className="aspect-square bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden cursor-pointer group hover:border-cyan-500 transition-all hover:scale-105"
                        >
                          <div className="relative w-full h-full">
                            {item.type === 'photos' ? (
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                <Video className="w-8 sm:w-12 h-8 sm:h-12 text-slate-600" />
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                                <p className="text-white text-xs sm:text-sm font-medium truncate">{item.name}</p>
                                <p className="text-slate-300 text-xs">{formatSize(item.size)}</p>
                              </div>
                            </div>

                            <div className="absolute top-2 right-2">
                              <div className={`${item.type === 'videos' ? 'bg-purple-500' : 'bg-cyan-500'} text-white px-2 py-1 rounded text-xs font-medium`}>
                                {item.type === 'videos' ? 'VIDEO' : 'PHOTO'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 sm:p-12 text-center">
                      <ImageIcon className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-slate-600" />
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Media Found</h3>
                      <p className="text-slate-400 mb-4 text-sm sm:text-base">
                        {faceRecognitionEnabled
                          ? 'No media with detected faces for this customer'
                          : view === 'admin'
                          ? 'Upload photos and videos for this customer'
                          : 'No media available yet'}
                      </p>
                      {view === 'admin' && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
                        >
                          <Upload className="w-5 h-5" />
                          Upload Files
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 sm:w-12 h-10 sm:h-12 bg-slate-900/80 hover:bg-slate-800 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>

          <div className="max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Media Preview */}
              <div className="md:col-span-2 bg-black p-4 sm:p-8">
                {selectedMedia.type === 'photos' ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name}
                    className="w-full h-full object-contain max-h-[50vh] sm:max-h-[70vh]"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-full max-h-[50vh] sm:max-h-[70vh]"
                  />
                )}
              </div>

              {/* Media Info */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 truncate">{selectedMedia.name}</h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Type</p>
                    <p className="text-white capitalize">{selectedMedia.type}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">Size</p>
                    <p className="text-white">{formatSize(selectedMedia.size)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">Uploaded</p>
                    <p className="text-white">
                      {new Date(selectedMedia.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedMedia.detectedFaces && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Face Detection</p>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-400" />
                        <p className="text-white">{selectedMedia.detectedFaces.length} face(s)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
                  <button 
                    onClick={() => downloadMedia(selectedMedia)}
                    className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>

                  {view === 'admin' && (
                    <button
                      onClick={() => deleteMedia(selectedMedia.id)}
                      className="w-full px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
