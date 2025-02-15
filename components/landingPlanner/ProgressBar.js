'use client';

import React from 'react';
import { Progress } from '@heroui/react';

export default function ProgressBar({ currentStep, totalSteps }) {
    const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

    return (
        <Progress
            className="my-4 pr-6 md:pr-0"
            color="primary"
            label={`${currentStep + 1} of ${totalSteps}`}
            max={100}
            value={progressPercentage}
        />
    );
}
