'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { title } from "@/components/primitives";

const ServiceTitle = () => {
    const words = ["Website", "Landing Page"];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, 5000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-xl flex flex-col text-center justify-center min-w-max">
            <span className={`${title({ color: "violet" })}`}>Plan your perfect&nbsp;</span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={words[currentWordIndex]}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${title({ color: "blue" })} lg:h-14 lg:mt-4`}
                    exit={{ opacity: 0, y: 10 }}
                    initial={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                >
                    {words[currentWordIndex]}&nbsp;
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

export default ServiceTitle;
