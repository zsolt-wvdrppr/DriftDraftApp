import React from 'react'
import { HoverEffectInput } from '@/components/HoverEffectInput'
import questionsData from "@/data/questions-data.json";
import { Textarea } from '@nextui-org/input';

const StepPurpose = () => {
  return (
    <div>

        <Textarea
            type="textarea"
            id="purpose"
            label={questionsData[0].question}
            labelPlacement='outside'
            isRequired
            placeholder="Enter your purpose here"
            classNames={{
             }}
        />

    </div>
  )
}

export default StepPurpose