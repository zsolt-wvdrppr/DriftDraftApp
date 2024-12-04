'use client';

import React from 'react';
import { Progress } from '@nextui-org/progress';

export default function ProgressBar({ currentStep, totalSteps }) {
    const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

    return (
        <Progress
            color="primary"
            value={progressPercentage}
            max={100}
            className="my-4"
            label={`${currentStep + 1} of ${totalSteps}`}
        />
    );
}
