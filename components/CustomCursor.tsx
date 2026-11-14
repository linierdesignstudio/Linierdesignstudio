
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchPointer, setIsTouchPointer] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    let touchHideTimer: number | undefined;

    const hideTouchCursorSoon = () => {
      window.clearTimeout(touchHideTimer);
      touchHideTimer = window.setTimeout(() => {
        setIsVisible(false);
        setIsTouchPointer(false);
      }, 700);
    };

    const updatePointerPosition = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
      setIsTouchPointer(e.pointerType === 'touch');
      if (e.pointerType === 'touch') {
        hideTouchCursorSoon();
      } else {
        window.clearTimeout(touchHideTimer);
      }
    };

    const handlePointerOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !(e.target instanceof Element)) {
        setIsHovering(false);
        return;
      }

      const target = e.target;
      if (
        target.matches('a, button') ||
        target.closest('a, button, .cursor-hover')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsClicking(true);
      setIsVisible(true);
      setIsTouchPointer(e.pointerType === 'touch');
      if (e.pointerType === 'touch') {
        hideTouchCursorSoon();
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      setIsClicking(false);
      if (e.pointerType === 'touch') {
        hideTouchCursorSoon();
      }
    };

    const hideCursor = () => {
      setIsVisible(false);
      setIsHovering(false);
      setIsClicking(false);
      setIsTouchPointer(false);
    };

    const handlePointerLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        hideTouchCursorSoon();
        return;
      }
      hideCursor();
    };

    window.addEventListener('pointermove', updatePointerPosition, { passive: true });
    window.addEventListener('pointerover', handlePointerOver);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('blur', hideCursor);

    return () => {
      window.removeEventListener('pointermove', updatePointerPosition);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', hideCursor);
      window.clearTimeout(touchHideTimer);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[10000] mix-blend-difference flex items-center justify-center"
      animate={{ opacity: isVisible ? 1 : 0 }}
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        className="bg-white flex items-center justify-center relative"
        animate={{
          width: isHovering ? 64 : isTouchPointer ? 24 : 10,
          height: isHovering ? 64 : isTouchPointer ? 24 : 10,
          rotate: isHovering || isTouchPointer ? 0 : 45,
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        style={{
          backgroundColor: isHovering || isTouchPointer ? 'transparent' : 'white',
          border: isHovering || isTouchPointer ? '1px solid white' : '0px solid transparent'
        }}
      >
         <motion.div 
            className="absolute bg-white/50"
            animate={{ 
                width: isHovering ? '120%' : '0%', 
                height: '1px',
                opacity: isHovering ? 1 : 0
            }} 
         />
         <motion.div 
            className="absolute bg-white/50"
            animate={{ 
                height: isHovering ? '120%' : '0%', 
                width: '1px',
                opacity: isHovering ? 1 : 0
            }} 
         />

         <motion.span 
            className="text-[8px] font-bold uppercase tracking-widest text-white absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering ? 1 : 0 }}
            transition={{ duration: 0.2 }}
         >
            VIEW
         </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
