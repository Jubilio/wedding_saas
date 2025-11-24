import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label, maxValue }) => {
    const percentage = (value / maxValue) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          {/* Background circle */}
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="50%"
              cy="50%"
              r="45"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50%"
              cy="50%"
              r="45"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-gold transition-all duration-1000 ease-out"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
            />
          </svg>
          
          {/* Number with Flip Animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={value}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-3xl md:text-4xl font-serif font-bold text-neutral-gray"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {String(value).padStart(2, '0')}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Label */}
        <span className="mt-3 text-sm md:text-base text-gray-600 uppercase tracking-wider">
          {label}
        </span>
      </motion.div>
    );
  };

  return (
    <div className="py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
        <TimeUnit value={timeLeft.days} label="Dias" maxValue={365} />
        <TimeUnit value={timeLeft.hours} label="Horas" maxValue={24} />
        <TimeUnit value={timeLeft.minutes} label="Minutos" maxValue={60} />
        <TimeUnit value={timeLeft.seconds} label="Segundos" maxValue={60} />
      </div>
      
      {timeLeft.days <= 30 && timeLeft.days > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-12 bg-gold/10 rounded-2xl p-8 max-w-md mx-auto"
        >
          <p className="text-gold font-serif text-base mb-2">Faltam apenas</p>
          <p className="text-7xl font-bold text-gold font-serif mb-2">{timeLeft.days}</p>
          <p className="text-gold font-serif text-lg">dias para o grande dia! 💕</p>
        </motion.div>
      )}
    </div>
  );
};

export default Countdown;
