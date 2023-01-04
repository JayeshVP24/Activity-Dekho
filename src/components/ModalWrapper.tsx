import { AnimatePresence, motion, Variants } from "framer-motion";
import { ReactNode } from "react";

const ModalWrapper: React.FC<{
  children: ReactNode;
  isModalOpen: boolean;
  closeModal: () => void;
  loading: boolean;
}> = ({children, isModalOpen, closeModal,  loading}) => {
  const variants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  };
  return (
    <section>
      <AnimatePresence>
        {isModalOpen && (
          <motion.section className="">
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 0.7,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={() => closeModal()}
              className={`bg-stone-800  w-screen h-screen fixed top-0 left-0    
           `}
            />
            <motion.div
              initial={{
                scale: 0.4,
                opacity: 0,
                top: "50%",
                left: "50%",
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              className={`bg-violet-400 fixed w-4/5 max-w-xl h-auto max-h-[85%]
                  top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%]
                  rounded-3xl px-10 py-16 
                  `}
            >
              
              {loading && (
                <motion.span
                  variants={variants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="text-3xl font-semibold w-full text-center"
                >
                  Loading 💭{" "}
                </motion.span>
              )}
        {children}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </section>
  );
};
export default ModalWrapper;
