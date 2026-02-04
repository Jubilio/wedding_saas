import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Trophy, ArrowRight } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { quizData as staticQuizData } from '../data/quizData';

const QuizPopup = ({ isOpen, onClose }) => {
  const { quiz: dynamicQuizData } = useEvent();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Use dynamic quiz data if available, otherwise fallback to static data
  const quizData = dynamicQuizData && dynamicQuizData.length > 0 
    ? dynamicQuizData.map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
        correctAnswer: q.correct_answer,
        explanation: q.explanation
      }))
    : staticQuizData;

  const handleAnswer = (index) => {
    if (selectedAnswer !== null || !quizData[currentQuestion]) return;
    
    setSelectedAnswer(index);
    const correct = index === quizData[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setIsFinished(false);
    setShowExplanation(false);
  };

  if (!isOpen || !quizData || quizData.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 overflow-hidden relative"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>

          {!isFinished ? (
            <div className="space-y-6">
              {/* Progress Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-sm font-medium text-gold uppercase tracking-wider">
                  Mini Quiz dos Noivos
                </span>
                <span className="text-xs text-gray-400">
                  Questão {currentQuestion + 1} de {quizData.length}
                </span>
              </div>

              {/* Question */}
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-serif text-neutral-gray leading-tight">
                  {quizData[currentQuestion].question}
                </h3>

                {/* Options */}
                <div className="grid gap-3">
                  {quizData[currentQuestion].options.map((option, index) => {
                    let buttonClass = "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ";
                    
                    if (selectedAnswer === null) {
                      buttonClass += "border-gray-100 hover:border-gold/50 hover:bg-gold/5 text-gray-700";
                    } else if (index === quizData[currentQuestion].correctAnswer) {
                      buttonClass += "border-green-500 bg-green-50 text-green-700";
                    } else if (index === selectedAnswer && !isCorrect) {
                      buttonClass += "border-red-500 bg-red-50 text-red-700";
                    } else {
                      buttonClass += "border-gray-50 opacity-50 text-gray-400";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={buttonClass}
                      >
                        <span className="font-medium">{option}</span>
                        {selectedAnswer !== null && index === quizData[currentQuestion].correctAnswer && (
                          <CheckCircle2 size={18} className="text-green-500" />
                        )}
                        {selectedAnswer === index && !isCorrect && (
                          <AlertCircle size={18} className="text-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation & Next */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className={`p-4 rounded-2xl text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
                      <p className="leading-relaxed">
                        {quizData[currentQuestion].explanation}
                      </p>
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-full bg-neutral-gray text-white py-4 rounded-2xl font-bold hover:bg-gold transition-all flex items-center justify-center gap-2 group"
                    >
                      {currentQuestion + 1 === quizData.length ? "Ver Resultado" : "Próxima Questão"}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center space-y-8 py-4">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                  <Trophy size={48} />
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-serif text-neutral-gray mb-2">Quiz Concluído!</h3>
                <p className="text-gray-500">
                  {score === quizData.length 
                    ? "Incrível! Conheces os noivos como ninguém! ✨" 
                    : score >= quizData.length / 2 
                    ? "Muito bem! Estás atento à história deles! ❤️" 
                    : "Obrigado por participares e conheceres um pouco mais sobre nós! 😊"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-3xl p-6">
                <span className="text-sm text-gray-400 uppercase tracking-widest block mb-1">Pontuação Final</span>
                <span className="text-5xl font-serif text-neutral-gray font-bold">
                  {score} <span className="text-2xl text-gray-300">/ {quizData.length}</span>
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetQuiz}
                  className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-gold text-white rounded-2xl font-bold hover:bg-gold/90 transition-all shadow-lg shadow-gold/20"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuizPopup;
