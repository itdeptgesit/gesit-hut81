"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn, Camera } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface GalleryImage {
  id: string;
  caption: string;
  driveId: string;
  folderName?: string;
}

function getDriveUrl(driveId: string) {
  return `/api/drive-image?id=${driveId}&sz=w600`;
}

function getDriveFullUrl(driveId: string) {
  return `/api/drive-image?id=${driveId}&sz=w1600`;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 24;
  const totalPages = Math.ceil(images.length / perPage);
  const currentImages = images.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d) => {
        if (d.images) setImages(d.images);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prevImage = useCallback(() => {
    setLightbox((i) => (i !== null ? (i - 1 + currentImages.length) % currentImages.length : null));
  }, [currentImages.length]);
  const nextImage = useCallback(() => {
    setLightbox((i) => (i !== null ? (i + 1) % currentImages.length : null));
  }, [currentImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, closeLightbox, prevImage, nextImage]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-28 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-4"
            >
              <Camera size={14} /> Galeri Foto
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading font-black text-3xl md:text-5xl text-foreground mb-4 tracking-tight"
            >
              Momen{" "}
              <span className="text-primary">HUT RI ke-81</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted text-base max-w-lg mx-auto"
            >
              Kumpulan foto dokumentasi acara perayaan HUT RI ke-81 GESIT yang penuh keceriaan dan kebersamaan.
            </motion.p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-muted text-sm">Memuat galeri foto...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center mb-6">
                <ImageIcon size={36} className="text-zinc-300" />
              </div>
              <h3 className="font-semibold text-zinc-500 text-lg mb-2">Belum ada foto</h3>
              <p className="text-zinc-400 text-sm">Foto akan segera ditambahkan oleh panitia.</p>
            </div>
          ) : (
            <>
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3"
              >
                {currentImages.map((img, idx) => (
                  <motion.div
                    key={img.id}
                    variants={{
                      hidden: { opacity: 0, scale: 0.95 },
                      show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
                    }}
                    className="break-inside-avoid group relative overflow-hidden rounded-2xl cursor-pointer bg-zinc-100 border border-border shadow-sm"
                    onClick={() => setLightbox(idx)}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getDriveUrl(img.driveId)}
                      alt={img.caption || `Foto ${idx + 1}`}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                    
                    {img.folderName && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider drop-shadow-sm border border-white/20">
                          {img.folderName}
                        </span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn
                        size={28}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
                      />
                    </div>
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-xs font-medium line-clamp-2">{img.caption}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-md px-2 hide-scrollbar">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors shrink-0 shadow-sm ${
                          page === i + 1 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && images[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              onClick={closeLightbox}
            >
              <X size={20} />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
              {lightbox + 1} / {currentImages.length} (Halaman {page})
            </div>

            {/* Prev */}
            <button
              className="absolute left-3 md:left-6 text-white/70 hover:text-white w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-10"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft size={22} />
            </button>

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getDriveFullUrl(currentImages[lightbox].driveId)}
                alt={currentImages[lightbox].caption || `Foto ${lightbox + 1}`}
                className="max-w-[90vw] max-h-[78vh] object-contain rounded-xl shadow-2xl"
              />
              {currentImages[lightbox].caption && (
                <p className="text-white/80 text-sm text-center max-w-lg">{currentImages[lightbox].caption}</p>
              )}
            </motion.div>

            {/* Next */}
            <button
              className="absolute right-3 md:right-6 text-white/70 hover:text-white w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-10"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
