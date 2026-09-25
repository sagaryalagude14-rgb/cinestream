import { useState, useCallback } from 'react';
import { MediaItem } from '../types/media';

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const openModal = useCallback((item: MediaItem) => {
    setSelectedMedia(item);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Delayed clear to avoid flash during exit animations
    setTimeout(() => {
      setSelectedMedia(null);
    }, 200);
  }, []);

  return {
    isOpen,
    selectedMedia,
    openModal,
    closeModal,
  };
}
