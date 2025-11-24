import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Check, X, Download } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { compressImage, createThumbnail, uploadPhoto, mergePhotoWithFrame, sanitizeInput } from '../utils/photoUtils';

const FRAMES = [
  { id: 'none', name: 'Sem Moldura', preview: null },
  { id: 'classic', name: 'Clássica', preview: '/frames/classic.png' },
  { id: 'polaroid', name: 'Polaroid', preview: '/frames/polaroid.png' },
  { id: 'floral', name: 'Floral', preview: '/frames/floral.png' }
];

const PhotoBooth = () => {
  const webcamRef = useRef(null);
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  const videoConstraints = {
    width: 1080,
    height: 1080,
    facingMode: 'user'
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const retakePhoto = () => {
    setCapturedImage(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (!guestName.trim()) {
      setError('Por favor, insira seu nome');
      return;
    }

    if (!capturedImage) {
      setError('Por favor, tire uma foto primeiro');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Create canvas from captured image
      const img = new Image();
      img.src = capturedImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1080, 1080);

      // Load and merge frame if selected
      let finalCanvas = canvas;
      if (selectedFrame.id !== 'none') {
        const frameImg = new Image();
        frameImg.src = selectedFrame.preview;
        await new Promise((resolve) => {
          frameImg.onload = resolve;
        });
        finalCanvas = await mergePhotoWithFrame(canvas, frameImg, selectedFrame.id);
      }

      // Compress and create thumbnail
      const imageBlob = await compressImage(finalCanvas, 0.85);
      const thumbnailBlob = await createThumbnail(finalCanvas, 200);

      // Upload to Firebase Storage
      const { imageUrl, thumbnailUrl } = await uploadPhoto(
        imageBlob,
        thumbnailBlob,
        sanitizeInput(guestName)
      );

      // Save metadata to Firestore
      await addDoc(collection(db, 'photos'), {
        guestName: sanitizeInput(guestName),
        imageUrl,
        thumbnailUrl,
        frameType: selectedFrame.id,
        status: 'pending',
        timestamp: serverTimestamp(),
        approvedBy: null,
        approvedAt: null
      });

      setUploadSuccess(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setCapturedImage(null);
        setGuestName('');
        setUploadSuccess(false);
        setSelectedFrame(FRAMES[0]);
      }, 3000);

    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Erro ao enviar foto. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-blush py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
            📸 Photo Booth
          </h1>
          <p className="text-lg text-neutral-gray">
            Capture um momento especial do nosso casamento!
          </p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6 text-center"
            >
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-serif text-green-700 mb-2">
                Foto Enviada com Sucesso!
              </h3>
              <p className="text-green-600">
                Sua foto será revisada e aparecerá na galeria em breve.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!uploadSuccess && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Camera/Preview Section */}
            <div className="relative bg-black aspect-square">
              {!capturedImage ? (
                <div className="relative w-full h-full">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={() => setCameraReady(true)}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Frame Overlay */}
                  {selectedFrame.preview && cameraReady && (
                    <img
                      src={selectedFrame.preview}
                      alt="Frame overlay"
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                      style={{ mixBlendMode: 'normal' }}
                      onError={(e) => {
                        console.error('Failed to load frame:', selectedFrame.preview);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => console.log('Frame loaded:', selectedFrame.preview)}
                    />
                  )}

                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <div className="text-white text-center">
                        <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                        <p>Carregando câmera...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  {selectedFrame.preview && (
                    <img
                      src={selectedFrame.preview}
                      alt="Frame overlay"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Controls Section */}
            <div className="p-6 space-y-6">
              {/* Frame Selector */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-3">
                  Escolha uma Moldura
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FRAMES.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => !capturedImage && setSelectedFrame(frame)}
                      disabled={capturedImage}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedFrame.id === frame.id
                          ? 'border-gold bg-gold/10'
                          : 'border-gray-200 hover:border-gold/50'
                      } ${capturedImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                        {frame.preview ? (
                          <img
                            src={frame.preview}
                            alt={frame.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <X className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-center">{frame.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              {capturedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors"
                    maxLength={100}
                  />
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!capturedImage ? (
                  <button
                    onClick={capturePhoto}
                    disabled={!cameraReady}
                    className="flex-1 bg-gold hover:bg-gold/90 disabled:bg-gray-300 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Tirar Foto
                  </button>
                ) : (
                  <>
                    <button
                      onClick={retakePhoto}
                      disabled={isUploading}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-charcoal py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Tirar Outra
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isUploading}
                      className="flex-1 bg-gold hover:bg-gold/90 disabled:bg-gold/50 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Enviar Foto
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white/50 backdrop-blur rounded-lg p-6">
          <h3 className="font-serif text-xl text-charcoal mb-3">Como Usar:</h3>
          <ol className="space-y-2 text-neutral-gray">
            <li>1. Escolha uma moldura para sua foto</li>
            <li>2. Posicione-se e tire a foto</li>
            <li>3. Insira seu nome</li>
            <li>4. Envie! Sua foto aparecerá na galeria após aprovação</li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
};

export default PhotoBooth;
