import React from 'react';
import { MessageSquareHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MessagesButton = () => {
  return (
    <Link to="/mensagens">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed md:bottom-24 bottom-36 right-4 z-40 bg-white text-rose-500 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow border-2 border-rose-100 flex items-center justify-center group"
        title="Ver Mural de Afeto"
      >
        <MessageSquareHeart className="w-8 h-8 fill-rose-50" />
        <span className="absolute right-full mr-3 bg-white text-gray-700 px-3 py-1 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Mural de Afeto
        </span>
      </motion.div>
    </Link>
  );
};

export default MessagesButton;
