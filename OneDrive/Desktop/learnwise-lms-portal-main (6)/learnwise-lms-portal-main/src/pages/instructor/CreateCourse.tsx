
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FilePlus, Plus, Trash, Upload, X, Video, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { useToast } from '../../hooks/use-toast';

const CreateCourse: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for form fields
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseImage, setCourseImage] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [price, setPrice] = useState('0');
  const [modules, setModules] = useState([
    { id: 1, title: '', description: '', contentType: 'video', content: '', duration: 0 }
  ]);

  // Video input method state
  const [videoInputMethod, setVideoInputMethod] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Course creation mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      const response = await api.post('/courses', courseData);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course submitted for approval successfully!",
      });
      // Reset form
      setCourseTitle('');
      setCourseDescription('');
      setCourseImage(null);
      setCategory('');
      setLevel('Beginner');
      setPrice('0');
      setModules([{ id: 1, title: '', description: '', contentType: 'video', content: '', duration: 0 }]);
      setVideoUrl('');
      setVideoFile(null);
    },
    onError: (error: any) => {
      console.error('Create course error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  // Function to add a new module
  const addModule = () => {
    const newId = modules.length > 0 ? Math.max(...modules.map(m => m.id)) + 1 : 1;
    setModules([...modules, { 
      id: newId, 
      title: '', 
      description: '', 
      contentType: 'video', 
      content: '', 
      duration: 0 
    }]);
  };

  // Function to remove a module
  const removeModule = (id: number) => {
    setModules(modules.filter(module => module.id !== id));
  };

  // Function to update module
  const updateModule = (id: number, field: string, value: any) => {
    setModules(modules.map(module => 
      module.id === id ? { ...module, [field]: value } : module
    ));
  };

  // Function to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCourseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to handle video file upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!courseTitle.trim()) {
      toast({
        title: "Error",
        description: "Course title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!courseDescription.trim()) {
      toast({
        title: "Error",
        description: "Course description is required",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }
    
    if (modules.length === 0) {
      toast({
        title: "Error",
        description: "At least one module is required",
        variant: "destructive",
      });
      return;
    }
    
    // Check if all modules have titles and content
    const invalidModule = modules.find(m => !m.title.trim() || !m.content.trim());
    if (invalidModule) {
      const moduleIndex = modules.indexOf(invalidModule);
      toast({
        title: "Error",
        description: `Module ${moduleIndex + 1} requires both title and content`,
        variant: "destructive",
      });
      return;
    }

    // Check video input
    if (videoInputMethod === 'url' && !videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please provide a video URL",
        variant: "destructive",
      });
      return;
    }

    if (videoInputMethod === 'upload' && !videoFile) {
      toast({
        title: "Error",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

    // Prepare course data
    const courseData = {
      title: courseTitle,
      description: courseDescription,
      category,
      level,
      price: parseFloat(price) || 0,
      thumbnail: courseImage || 'default-course.jpg',
      modules: modules.map(module => ({
        title: module.title,
        description: module.description,
        contentType: module.contentType,
        content: module.content,
        duration: module.duration || 0,
        order: modules.indexOf(module) + 1
      })),
      mainVideo: videoInputMethod === 'url' ? videoUrl : 'uploaded-file', // In real app, handle file upload
      isPublished: false, // Courses need admin approval
      instructor: user?._id
    };
    
    console.log('Course data being submitted:', courseData);
    createCourseMutation.mutate(courseData);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Course</h1>
        <p className="text-gray-400">Design your course structure and content for admin approval</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Section */}
            <div className="lms-card">
              <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-400 mb-1">
                    Course Title*
                  </label>
                  <input
                    type="text"
                    id="courseTitle"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                    placeholder="e.g., Mastering React.js Development"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-400 mb-1">
                    Course Description*
                  </label>
                  <textarea
                    id="courseDescription"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                    placeholder="Provide a detailed description of your course..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">
                      Category*
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Game Development">Game Development</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-400 mb-1">
                      Level*
                    </label>
                    <select
                      id="level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Course Video Section */}
            <div className="lms-card">
              <h2 className="text-xl font-bold text-white mb-4">Main Course Video</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Video Input Method*</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="videoMethod"
                        value="url"
                        checked={videoInputMethod === 'url'}
                        onChange={() => setVideoInputMethod('url')}
                        className="mr-2"
                      />
                      <LinkIcon size={16} className="mr-1" />
                      <span className="text-white">Video URL</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="videoMethod"
                        value="upload"
                        checked={videoInputMethod === 'upload'}
                        onChange={() => setVideoInputMethod('upload')}
                        className="mr-2"
                      />
                      <Upload size={16} className="mr-1" />
                      <span className="text-white">Upload Video</span>
                    </label>
                  </div>
                </div>

                {videoInputMethod === 'url' ? (
                  <div>
                    <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-400 mb-1">
                      Video URL* (YouTube, Vimeo, etc.)
                    </label>
                    <input
                      type="url"
                      id="videoUrl"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Upload Video File*
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                      {videoFile ? (
                        <div className="flex items-center justify-center">
                          <Video size={24} className="text-green-400 mr-2" />
                          <span className="text-white">{videoFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setVideoFile(null)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Video size={48} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-400 mb-2">Click to upload video</p>
                          <p className="text-xs text-gray-500">MP4, AVI, MOV (MAX. 100MB)</p>
                          <input
                            type="file"
                            onChange={handleVideoUpload}
                            accept="video/*"
                            className="hidden"
                            id="videoUpload"
                          />
                          <label
                            htmlFor="videoUpload"
                            className="mt-2 inline-block px-4 py-2 bg-lms-primary text-white rounded-md cursor-pointer hover:bg-lms-primary/80"
                          >
                            Choose Video File
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Course Modules Section */}
            <div className="lms-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Course Modules</h2>
                <button 
                  type="button"
                  onClick={addModule}
                  className="lms-button-primary flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Module
                </button>
              </div>
              
              <div className="space-y-6">
                {modules.map((module, moduleIndex) => (
                  <div key={module.id} className="p-4 border border-gray-800 rounded-lg bg-gray-800/50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-white">Module {moduleIndex + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeModule(module.id)}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                        placeholder="Module Title*"
                        required
                      />
                      <textarea
                        value={module.description}
                        onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                        placeholder="Module Description"
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={module.contentType}
                          onChange={(e) => updateModule(module.id, 'contentType', e.target.value)}
                          className="p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                        >
                          <option value="video">Video</option>
                          <option value="text">Text</option>
                          <option value="pdf">PDF</option>
                          <option value="quiz">Quiz</option>
                        </select>
                        <input
                          type="number"
                          value={module.duration}
                          onChange={(e) => updateModule(module.id, 'duration', parseInt(e.target.value) || 0)}
                          className="p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                          placeholder="Duration (minutes)"
                          min="0"
                        />
                      </div>
                      <input
                        type="text"
                        value={module.content}
                        onChange={(e) => updateModule(module.id, 'content', e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-lms-primary"
                        placeholder={`${module.contentType === 'video' ? 'Video URL' : module.contentType === 'pdf' ? 'PDF URL' : 'Content'}*`}
                        required
                      />
                    </div>
                  </div>
                ))}
                
                {modules.length === 0 && (
                  <div className="text-center p-6 bg-gray-800/20 border border-gray-800 rounded-lg">
                    <FilePlus size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400">No modules yet. Click "Add Module" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Image Upload */}
            <div className="lms-card">
              <h3 className="text-lg font-bold text-white mb-3">Course Thumbnail</h3>
              
              <div className="mb-4">
                {courseImage ? (
                  <div className="relative">
                    <img 
                      src={courseImage}
                      alt="Course preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setCourseImage(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400 mb-1">Click to upload course thumbnail</p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                    </div>
                    <input 
                      type="file"
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-xs text-gray-400">
                Recommended size: 1280×720 pixels (16:9 ratio)
              </p>
            </div>
            
            {/* Publication Details */}
            <div className="lms-card">
              <h3 className="text-lg font-bold text-white mb-3">Publication Process</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-4">
                  Your course will go through our approval process before being published to students.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 rounded-full bg-lms-primary flex items-center justify-center mr-3 text-white font-bold">1</div>
                    <span className="text-gray-300">Submit for Review</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-white font-bold">2</div>
                    <span className="text-gray-300">Admin Review & Approval</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-white font-bold">3</div>
                    <span className="text-gray-300">Live for Students</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-white font-bold">4</div>
                    <span className="text-gray-300">Student Chat Access</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="lms-card">
              <button 
                type="submit" 
                disabled={createCourseMutation.isPending}
                className="lms-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {createCourseMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit for Approval'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CreateCourse;
