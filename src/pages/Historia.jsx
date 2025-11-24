import React from 'react';
import { motion } from 'framer-motion';
import coupleStanding from '../assets/couple_standing.jpg';
import DecorativeDivider from '../components/DecorativeDivider';

const Historia = () => {
  return (
    <div className="pt-24 pb-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-serif text-center text-neutral-gray mb-8"
        >
          Nossa História
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gold italic mb-16 max-w-2xl mx-auto"
        >
          Uma história escrita com paciência, graça e amor que amadureceu no tempo perfeito
        </motion.p>

        <div className="mb-16 flex justify-center">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            src={coupleStanding} 
            alt="Binth e Jubílio" 
            className="rounded-2xl shadow-2xl max-h-96 object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-gold"
          >
            <p className="text-gray-700 leading-relaxed text-lg">
              A história deles começa muito antes de serem "nós". Começa num desejo de Jubílio, num desenho silencioso da mulher que sonhava ter ao seu lado — e num Deus que, com toda Sua graça, aprovou esse sonho.
            </p>
          </motion.div>

          <DecorativeDivider variant="hearts" />

          {/* 2021 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-6 items-start"
          >
            <div className="flex-shrink-0 w-24 text-right">
              <span className="text-5xl font-serif text-gold/30 font-bold">2021</span>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-serif text-neutral-gray mb-3">A Primeira Tentativa</h3>
              <p className="text-gray-600 leading-relaxed">
                Em 2021, Jubílio fez a sua primeira tentativa de aproximação, usando como pretexto uma camisola emprestada. Uma estratégia tímida, suave… e que não deu muito certo, já que Binth acabou apagando a plataforma onde conversavam. Mas Deus já tinha o tempo certo preparado.
              </p>
            </div>
          </motion.div>

          {/* 2022 - August */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-6 items-start flex-row-reverse"
          >
            <div className="flex-shrink-0 w-24 text-left">
              <span className="text-5xl font-serif text-gold/30 font-bold">2022</span>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-serif text-neutral-gray mb-3">O Recomeço</h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                Em 2022, depois de uma vigília, Jubílio voltou a falar com Binth — desta vez insinuando que ela tinha o número dele, mas nunca escrevia. E foi assim que recomeçaram a conversar. Ali, ele começou a revelar com mais clareza o seu coração. Mas Binth ainda não estava pronta. Recusou duas vezes, esperando pelo momento certo.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Só em dezembro de 2022, após voltar de uma viagem em campo, sentiu que estava pronta para dizer "sim".
              </p>
            </div>
          </motion.div>

          {/* Pull Quote */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="my-16 max-w-2xl mx-auto"
          >
            <blockquote className="relative py-8 px-12 bg-gradient-to-br from-gold/5 to-gold/10 rounded-2xl border-l-4 border-gold">
              <svg className="absolute top-4 left-4 w-8 h-8 text-gold/30" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z"/>
              </svg>
              <p className="text-xl md:text-2xl font-serif italic text-gray-700 text-center relative z-10">
                "O amor não é apenas olhar um para o outro, mas olhar juntos na mesma direção."
              </p>
              <svg className="absolute bottom-4 right-4 w-8 h-8 text-gold/30 transform rotate-180" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z"/>
              </svg>
            </blockquote>
          </motion.div>

          {/* 2023 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-6 items-start"
          >
            <div className="flex-shrink-0 w-24 text-right">
              <span className="text-5xl font-serif text-gold/30 font-bold">2023</span>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-serif text-neutral-gray mb-3">O Primeiro Encontro</h3>
              <p className="text-gray-600 leading-relaxed">
                Em 2023 tiveram o primeiro encontro como namorados, no D'bambu — o lugar favorito de Jubílio, que naturalmente se tornou ainda mais especial desde aquele dia.
              </p>
            </div>
          </motion.div>

          {/* 2024 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-6 items-start flex-row-reverse"
          >
            <div className="flex-shrink-0 w-24 text-left">
              <span className="text-5xl font-serif text-gold/30 font-bold">2024</span>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-serif text-neutral-gray mb-3">Distância que Fortaleceu</h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                2024 chegou com distância geográfica, novos desafios e novos caminhos. Jubílio começou a trabalhar fora da província de Maputo, mas nenhum quilómetro conseguiu enfraquecer aquilo que estavam a construir. Pelo contrário: fortaleceu.
              </p>
              <p className="text-gray-600 leading-relaxed">
                No dia 5 de dezembro de 2024, Jubílio em Pemba e Binth numa vigília, fizeram juntos o plano que mudaria as suas vidas — casar na mesma data no ano seguinte. Ao regressar em dezembro, Jubílio selou esse propósito com o anel de compromisso, marcando o início de uma nova etapa da caminhada.
              </p>
            </div>
          </motion.div>

          {/* 2025-2026 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-6 items-start"
          >
            <div className="flex-shrink-0 w-24 text-right">
              <span className="text-5xl font-serif text-gold/30 font-bold">2025</span>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-serif text-neutral-gray mb-3">Rumo ao Grande Dia</h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                2025 trouxe as famílias mais próximas, o pedido formal, o começo dos preparativos e a confirmação de que Deus estava — e sempre esteve — no centro de tudo.
              </p>
              <p className="text-gray-600 leading-relaxed font-semibold text-gold">
                E agora seguem firmes rumo ao grande dia: 07 de março de 2026.
              </p>
            </div>
          </motion.div>

          <DecorativeDivider variant="rings" />

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gold/10 to-gold/5 p-8 rounded-2xl text-center mt-12"
          >
            <p className="text-xl font-serif text-neutral-gray italic leading-relaxed">
              Uma história escrita com paciência, graça, encontros inesperados, segundos começos…<br />
              E, acima de tudo, amor que amadureceu no tempo perfeito.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Historia;
