'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { title, subtitle } from "@/components/primitives";

const ServiceTitle = () => {
    const words = ["Website", "Website Blueprint", "Landing Page"];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, 3000); // Change every 3 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-xl text-center justify-center min-w-max">
            <span className={`${title({ color: "violet" })}`}>Create a&nbsp;</span>
            <span className={title()}>Strategic&nbsp;</span>
            <br />
            <AnimatePresence mode="wait">
                <motion.span
                    key={words[currentWordIndex]}
                    className={`${title({ color: "blue" })}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5 }}
                >
                    {words[currentWordIndex]}&nbsp;
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

export default ServiceTitle;
