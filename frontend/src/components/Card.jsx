import React, { useContext } from 'react';
import { userDataContext } from '../context/UserContext';
import { FiCheck } from 'react-icons/fi';

const Card = ({ image }) => {
  const { setFrontendImage, setBackendImage, selectedImage, setSelectedImage } = useContext(userDataContext);
  const isSelected = selectedImage === image;

  return (
    <div
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
      className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 bg-white border-2 shadow-xs ${
        isSelected
          ? 'border-[#C96F5A] ring-4 ring-[#C96F5A]/20 scale-[1.03] shadow-md'
          : 'border-[#E7E3DC] hover:border-[#D5D0C7] hover:scale-[1.01]'
      }`}
    >
      <img
        src={image}
        alt="Assistant Persona"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
      />

      {/* Subtle bottom vignette gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Active selection checkmark badge */}
      {isSelected && (
        <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#C96F5A] text-white flex items-center justify-center shadow-xs">
          <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}
    </div>
  );
};

export default Card;