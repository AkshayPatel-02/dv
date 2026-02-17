import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ArrowLeft } from 'lucide-react';

// Event gallery configuration — maps slug to folder name, display title, and image list
const eventGalleries: Record<string, { title: string; folder: string; images: { num: number; ext: string }[] }> = {
  'ignis-xr': {
    title: 'IGNIS XR-AI',
    folder: 'IGNIS_XR',
    images: [
      ...[1, 2, 3, 4, 5, 13, 14, 15, 16, 17].map(n => ({ num: n, ext: 'png' })),
      ...[22, 23, 24, 25].map(n => ({ num: n, ext: 'jpg' })),
    ],
  },
  'bi-nexus': {
    title: 'BI Nexus',
    folder: 'BI_Nexus',
    images: [6, 7, 8, 9, 10, 11, 18, 19].map(n => ({ num: n, ext: 'png' })),
  },
  'vaidhushi': {
    title: 'VAIDHUSHI',
    folder: 'VAIDHUSHI',
    images: [12, 20, 21].map(n => ({ num: n, ext: 'png' })),
  },
  'contribx': {
    title: 'ContribX',
    folder: 'ContribX',
    images: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].map(n => ({ num: n, ext: 'png' })),
  },
};

const EventGallery = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const gallery = eventSlug ? eventGalleries[eventSlug] : undefined;

  if (!gallery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">No gallery found for this event.</p>
        <Link to="/events" className="btn-academic px-6 py-3">
          Back to Events
        </Link>
      </div>
    );
  }

  const galleryImages = gallery.images.map(img => ({
    src: `/Gallery/${gallery.folder}/${img.num}.${img.ext}`,
    alt: `${gallery.title} - Photo ${img.num}`,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-academic hero-gradient text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">{gallery.title}</h1>
            <p className="text-xl lg:text-2xl max-w-3xl mx-auto text-white/90 mb-6">
              Event Gallery
            </p>
            <Link
              to="/events"
              state={{ tab: 'past' }}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Back to Events</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-academic bg-background text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-medium text-sm">{image.alt}</h3>
                  </div>
                  <div className="absolute top-4 right-4">
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Event Photo"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventGallery;
