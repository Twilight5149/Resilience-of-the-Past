import { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Upload, Link as LinkIcon, MapPin, Loader2 } from "lucide-react";
import {
  fetchChurches,
  createChurch,
  updateChurch,
  deleteChurch,
  uploadImage,
  type Church
} from "../../../services/churchAPI";
import { getPublicImageUrl } from "../../../utils/supabase";

export default function ChurchManagementWithAPI() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChurch, setEditingChurch] = useState<Church | null>(null);
  const [formData, setFormData] = useState<Partial<Church>>({});
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load churches on mount
  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const data = await fetchChurches();
      setChurches(data);
    } catch (error) {
      console.error("Failed to load churches:", error);
      alert("Failed to load churches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (church?: Church) => {
  if (church) {
    setEditingChurch(church);
    setFormData(prev => ({
      ...prev,
      ...church,
      images: Array.isArray(church.images) ? church.images : [],
      description: church.description || "",
      history: church.history || "",
      unrated: church.unrated || false,
    }));
  } else {
    setEditingChurch(null);
    setFormData({
      images: [],
      unrated: false,
    });
  }
  setShowForm(true);
};

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingChurch(null);
    setFormData({});
    setImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (editingChurch) {
        const updated = await updateChurch(editingChurch.id, formData);
        setChurches(churches.map(c => c.id === updated.id ? updated : c));
      } else {
        const newChurch = await createChurch(formData as Omit<Church, "id">);
        setChurches([...churches, newChurch]);
      }

      handleCloseForm();
    } catch (error) {
      console.error("Failed to save church:", error);
      alert("Failed to save church. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this church?")) return;
    try {
      await deleteChurch(id);
      setChurches(churches.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete church:", error);
      alert("Failed to delete church. Please try again.");
    }
  };

  // Image handling
  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    setFormData({
      ...formData,
      images: [...(formData.images || []), imageUrl.trim()],
    });
    setImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index) || [],
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleFiles = async (files: FileList) => {
  try {
    setUploadingImages(true);

    // 1. Generate temporary local URLs for immediate previews
    const previewUrls = Array.from(files).map(file => URL.createObjectURL(file));
    
    // Add previews to UI immediately
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...previewUrls],
    }));

    // 2. Upload and get the raw filenames
    const uploadedFileNames = await Promise.all(
      Array.from(files).map(file => uploadImage(file))
    );

    // 3. Replace the blob previews with the real filenames for the database
    setFormData(prev => {
      const existingImages = prev.images?.slice(0, -(files.length)) || [];
      return {
        ...prev,
        images: [...existingImages, ...uploadedFileNames],
      };
    });

  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    setUploadingImages(false);
  }
};

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Church Management</h1>
          <p className="text-gray-600">Add, edit, and manage church data</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Church
        </button>
      </div>

      {/* Church list */}
      {churches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-lg">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No churches yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first church</p>
          <button
            onClick={() => handleOpenForm()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Church
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {churches.map(church => (
            <div key={church.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex gap-6">
                {church.images && church.images[0] && (
                  <img
                    src={church.images[0]}
                    alt={church.name}
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{church.name}</h2>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{church.city}, {church.province}, {church.country}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenForm(church)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(church.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Founded:</span> <span className="ml-2 font-medium">{church.founded}</span></div>
                    <div><span className="text-gray-600">Diocese:</span> <span className="ml-2 font-medium">{church.diocese || "N/A"}</span></div>
                    <div><span className="text-gray-600">Feast:</span> <span className="ml-2 font-medium">{church.feast || "N/A"}</span></div>
                    <div><span className="text-gray-600">Style:</span> <span className="ml-2 font-medium">{church.architecturalStyle}</span></div>
                    {church.structuralRating && <div><span className="text-gray-600">Rating:</span> <span className="ml-2 font-medium">{church.structuralRating}/10</span></div>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingChurch ? "Edit Church" : "Add New Church"}</h2>
              <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-lg" disabled={submitting}><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Church Name *</label>
                  <input type="text" required value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>

                {/* Founded, Style, Address, City, Province, Country */}
                <div><label className="block text-sm font-medium mb-2">Founded Year *</label>
                  <input type="number" required value={formData.founded || ""} onChange={e => setFormData({...formData, founded: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>
                <div><label className="block text-sm font-medium mb-2">Architectural Style *</label>
                  <input type="text" required value={formData.architecturalStyle || ""} onChange={e => setFormData({...formData, architecturalStyle: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Address *</label>
                  <input type="text" required value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>
                <div><label className="block text-sm font-medium mb-2">City *</label>
                  <input type="text" required value={formData.city || ""} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>
                <div><label className="block text-sm font-medium mb-2">Province *</label>
                  <input type="text" required value={formData.province || ""} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>
                <div><label className="block text-sm font-medium mb-2">Country *</label>
                  <input type="text" required value={formData.country || ""} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>

                {/* Optional fields: Diocese, Feast */}
                <div><label className="block text-sm font-medium mb-2">Diocese</label>
                  <input type="text" value={formData.diocese || ""} onChange={e => setFormData({...formData, diocese: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>
                <div><label className="block text-sm font-medium mb-2">Feast Day</label>
                  <input type="text" value={formData.feast || ""} onChange={e => setFormData({...formData, feast: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>

                {/* Latitude / Longitude */}
                <div><label className="block text-sm font-medium mb-2">Latitude *</label>
                  <input type="number" step="any" required value={formData.lat || ""} onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>
                <div><label className="block text-sm font-medium mb-2">Longitude *</label>
                  <input type="number" step="any" required value={formData.lng || ""} onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>

                {/* Structural Rating / Unrated */}
                <div><label className="block text-sm font-medium mb-2">Structural Rating (1-10)</label>
                  <input type="number" min="1" max="10" value={formData.structuralRating || ""} onChange={e => setFormData({...formData, structuralRating: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.unrated || false} onChange={e => setFormData({...formData, unrated: e.target.checked})} className="w-4 h-4" disabled={submitting} />
                    <span className="text-sm font-medium">Unrated</span>
                  </label>
                </div>

                {/* Description & History */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea required rows={3} value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">History *</label>
                  <textarea required rows={4} value={formData.history || ""} onChange={e => setFormData({...formData, history: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" disabled={submitting} />
                </div>

                {/* Images Section */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-3">Images</label>

                  {/* Drag & Drop */}
                  <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"} ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {uploadingImages ? (
                      <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    )}
                    <p className="text-gray-600 mb-2">{uploadingImages ? 'Uploading...' : 'Drag and drop images here, or'}</p>
                    {!uploadingImages && (
                      <>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-600 hover:text-blue-700 font-medium" disabled={submitting}>Browse files</button>
                        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" />
                      </>
                    )}
                  </div>

                  {/* URL input */}
                  <div className="flex gap-2 mt-4">
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        placeholder="Or paste image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) => { if(e.key==="Enter"){ e.preventDefault(); handleAddImageUrl(); }}}
                        onPaste={(e) => { const paste = e.clipboardData.getData("text"); if(paste){ setImageUrl(paste.trim()); handleAddImageUrl(); e.preventDefault(); } }}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={submitting || uploadingImages}
                      />
                    </div>
                    <button type="button" onClick={handleAddImageUrl} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg" disabled={submitting || uploadingImages}>Add URL</button>
                  </div>

                  {/* Image previews */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {formData.images.map((img, index) => (
                            <div key={index} className="relative group">
                              <img 
                                /* Check if it's a blob (newly added) or a raw path (existing) */
                                key={index}
                                src={img.startsWith('blob:') ? img : getPublicImageUrl(img)} 
                                alt="Preview" 
                                className="w-full h-32 object-cover rounded-lg" 
                              />
                          <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" disabled={submitting}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end mt-6">
                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2" disabled={submitting}>
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingChurch ? "Update Church" : "Add Church"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}