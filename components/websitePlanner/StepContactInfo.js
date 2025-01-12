'use client';

import React, { useState, useImperativeHandle } from 'react';
import { Input, RadioGroup, Radio } from '@nextui-org/react';
import { IconMail, IconWorldWww, IconUsers, IconId, IconPhone } from '@tabler/icons-react';

import questionsData from "@/data/questions-data.json";
import logger from '@/lib/logger';
import { useSessionContext } from '@/lib/SessionProvider';

const StepContactInfo = ({ ref }) => {
    const { sessionData, updateFormData, setError } = useSessionContext();
    const stepNumber = 9;
    const content = questionsData[stepNumber];
    const formData = sessionData.formData;

    // Initialize formValues from formData or create an empty structure
    const [formValues, setFormValues] = useState(() => {
        if (formData[stepNumber]) {
            return { ...formData[stepNumber] };
        }

        return content.fields.reduce((acc, field) => {
            acc[field.question.replace(/\s+/g, '').toLowerCase()] = '';

            return acc;
        }, {});
    });

    const [validationErrors, setValidationErrors] = useState({});

    // Expose validation logic via useImperativeHandle
    useImperativeHandle(ref, () => ({
        validateStep: () => {
            const isValid = validateForm();

            updateFormData(stepNumber, { ...formValues, isValid });

            return isValid;
        },
    }));

    // Handle changes dynamically for all field types
    const handleChange = (field, value) => {
        const updatedValues = { ...formValues, [field]: value };

        logger.info("updatedValues", updatedValues);
        setFormValues(updatedValues);

        // Update formData
        updateFormData(stepNumber, { ...updatedValues, isValid: false });

        // Validate the specific field
        validateField(field, value);
    };

    // Validate individual fields
    const validateField = (field, value) => {
        const fieldMeta = content.fields.find(
            (f) => f.question.replace(/\s+/g, '').toLowerCase() === field
        );

        if (!fieldMeta) return;

        let error = '';

        if (fieldMeta.required && !value) {
            error = 'This field is required.';
        } else if (
            fieldMeta.question.toLowerCase().includes('email') &&
            !validateEmail(value)
        ) {
            error = 'Invalid email address.';
        } else if (
            fieldMeta.question.toLowerCase().includes('phone') &&
            !validateTel(value)
        ) {
            error = 'Invalid phone number.';
        } else if (
            fieldMeta.question.toLowerCase().includes('website') &&
            value &&
            !validateURL(value)
        ) {
            error = 'Invalid website URL.';
        }

        setValidationErrors((prev) => ({
            ...prev,
            [field]: error,
        }));
    };

    // Validate the entire form
    const validateForm = () => {
        const errors = {};

        content.fields.forEach((field) => {
            const fieldKey = field.question.replace(/\s+/g, '').toLowerCase();
            const value = formValues[fieldKey];

            if (field.required && !value) {
                errors[fieldKey] = 'This field is required.';
            } else if (
                field.question.toLowerCase().includes('email') &&
                !validateEmail(value)
            ) {
                errors[fieldKey] = 'Invalid email address.';
            } else if (
                field.question.toLowerCase().includes('phone') &&
                !validateTel(value)
            ) {
                errors[fieldKey] = 'Invalid phone number.';
            } else if (
                field.question.toLowerCase().includes('website') &&
                value &&
                !validateURL(value)
            ) {
                errors[fieldKey] = 'Invalid website URL.';
            }
        });

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // Utility functions for validation
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const validateTel = (value) => /^\+?(\d.*){3,}$/.test(value);

    const validateURL = (url) => {

        // Remove protocol if present for domain validation
        const domainPart = url.replace(/^https?:\/\//, '');
        const parts = domainPart.split('.');

        // If starts with www, need 3 parts, else need 2 parts
        if ((parts[0] === 'www' && parts.length < 3) ||
            (parts[0] !== 'www' && parts.length < 2)) return false;

        const domainPartPattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

        return parts.every(part => domainPartPattern.test(part));
    };

    return (
        <form>
            <div className="md:py-10 max-w-screen-md mx-auto">
                <div className="col-span-3 grid grid-cols-2 gap-4 items-center mt-8">
                    {content.fields.map((field, index) => (
                        <div key={index} className="relative">
                            {/* Render Input Fields */}
                            {field.type === 'text' && (
                                <Input
                                    autoComplete={field.question.toLowerCase()}
                                    classNames={{
                                        label: "!text-primary dark:!text-accentMint text-sm md:text-md",
                                        inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${validationErrors[field.question.replace(/\s+/g, '').toLowerCase()]
                                            ? 'border-danger'
                                            : ''
                                            }`,
                                        base: "pt-4",
                                        input: "",
                                    }}
                                    isRequired={field.required}
                                    label={field.question}
                                    labelPlacement='outside'
                                    startContent={
                                        field.question.toLowerCase().includes('email') ? <IconMail className='text-primary dark:text-accentMint' size={20} /> :
                                            field.question.toLowerCase().includes('phone') ? <IconPhone className='text-primary dark:text-accentMint' size={20} /> :
                                                field.question.toLowerCase().includes('website') ? <IconWorldWww className='text-primary dark:text-accentMint' size={20} /> :
                                                    field.question.toLowerCase().includes('name') ? <IconId className='text-primary dark:text-accentMint' size={20} /> :
                                                        field.question.toLowerCase().includes('employee') ? <IconUsers className='text-primary dark:text-accentMint' size={20} /> : ''
                                    }
                                    value={formValues[field.question.replace(/\s+/g, '').toLowerCase()]}
                                    onChange={(e) =>
                                        handleChange(
                                            field.question.replace(/\s+/g, '').toLowerCase(),
                                            e.target.value
                                        )
                                    }
                                />
                            )}

                            {/* Render Number Fields */}
                            {field.type === 'number' && (
                                <Input
                                    classNames={{
                                        label: "!text-primary dark:!text-accentMint text-sm md:text-md",
                                        inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${validationErrors[field.question.replace(/\s+/g, '').toLowerCase()]
                                            ? 'border-danger'
                                            : ''
                                            }`,
                                        base: "pt-4",
                                        input: "",
                                    }}
                                    label={field.question}
                                    labelPlacement='outside'
                                    startContent={<IconUsers className='text-primary dark:text-accentMint' size={20} />}
                                    type="number"
                                    value={formValues[field.question.replace(/\s+/g, '').toLowerCase()]}
                                    onChange={(e) =>
                                        handleChange(
                                            field.question.replace(/\s+/g, '').toLowerCase(),
                                            e.target.value
                                        )
                                    }
                                />
                            )}

                            {/* Render RadioGroup Fields */}
                            {field.type === 'select' && field.question === 'Are you a Start-Up?' && (
                                <RadioGroup
                                    classNames={{
                                        label: "!text-primary dark:!text-accentMint text-sm md:text-md",
                                    }}
                                    color="secondary"
                                    label={field.question}
                                    orientation="horizontal"
                                    value={formValues['isStartup']}
                                    onChange={(e) => handleChange('isStartup', e.target.value)}
                                >
                                    {field.options.map((option, idx) => (
                                        <Radio key={idx} value={option}>
                                            {option}
                                        </Radio>
                                    ))}
                                </RadioGroup>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </form>
    );
};

export default StepContactInfo;
