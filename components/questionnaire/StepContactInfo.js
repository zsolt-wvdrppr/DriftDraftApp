'use client';

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Input, RadioGroup, Radio } from '@nextui-org/react';
import Sidebar from './actionsBar';
import questionsData from "@/data/questions-data.json";
import { IconSignature, IconMail, IconWorldWww, IconUsers, IconId, IconPhone, IconBuilding } from '@tabler/icons-react';

const StepContactInfo = forwardRef(({ formData, setFormData, setError }, ref) => {
    const stepNumber = 9;
    const content = questionsData[stepNumber];

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

    // Initialize formData if not present
    useEffect(() => {
        if (!formData[stepNumber]) {
            console.log("init formData", formData);
            setFormData((prev) => ({
                ...prev,
                [stepNumber]: { ...formValues, isValid: false },
            }));
        }
    }, [formData, setFormData, stepNumber]);

    // Expose validation logic via useImperativeHandle
    useImperativeHandle(ref, () => ({
        validateStep: () => {
            const isValid = validateForm();
            setFormData((prev) => ({
                ...prev,
                [stepNumber]: { ...formValues, isValid },
            }));
            return isValid;
        },
    }));

    // Handle changes dynamically for all field types
    const handleChange = (field, value) => {
        const updatedValues = { ...formValues, [field]: value };
        console.log("updatedValues", updatedValues);
        setFormValues(updatedValues);

        // Update formData
        setFormData((prev) => ({
            ...prev,
            [stepNumber]: { ...updatedValues, isValid: false },
        }));

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
            <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
                <div className="col-span-4 flex-1">
                    <h2 className="text-lg font-semibold my-4 text-primary dark:text-slate-100">
                        {content.section} {content.required && <span className="text-red-500">*</span>}
                    </h2>
                </div>
                <div className="col-span-3 grid grid-cols-2 gap-4 items-center">
                    {content.fields.map((field, index) => (
                        <div key={index} className="relative">
                            {/* Render Input Fields */}
                            {field.type === 'text' && (
                                <Input
                                    label={field.question}
                                    value={formValues[field.question.replace(/\s+/g, '').toLowerCase()]}
                                    labelPlacement='outside'
                                    onChange={(e) =>
                                        handleChange(
                                            field.question.replace(/\s+/g, '').toLowerCase(),
                                            e.target.value
                                        )
                                    }
                                    startContent={
                                        field.question.toLowerCase().includes('email') ? <IconMail className='text-primary' size={20} /> :
                                            field.question.toLowerCase().includes('phone') ? <IconPhone className='text-primary' size={20} /> :
                                                field.question.toLowerCase().includes('website') ? <IconWorldWww className='text-primary' size={20} /> :
                                                    field.question.toLowerCase().includes('name') ? <IconId className='text-primary' size={20} /> :
                                                        field.question.toLowerCase().includes('employee') ? <IconUsers className='text-primary' size={20} /> : ''
                                    }
                                    isRequired={field.required}
                                    classNames={{
                                        label: "!text-primary dark:!text-white text-sm md:text-md",
                                        inputWrapper: `hover:!bg-yellow-50 border ${validationErrors[field.question.replace(/\s+/g, '').toLowerCase()]
                                            ? 'border-danger'
                                            : ''
                                            }`,
                                        base: "dark:!text-neutralDark pt-4",
                                        input: "dark:!text-neutralDark",
                                    }}
                                />
                            )}

                            {/* Render Number Fields */}
                            {field.type === 'number' && (
                                <Input
                                    label={field.question}
                                    type="number"
                                    value={formValues[field.question.replace(/\s+/g, '').toLowerCase()]}
                                    labelPlacement='outside'
                                    onChange={(e) =>
                                        handleChange(
                                            field.question.replace(/\s+/g, '').toLowerCase(),
                                            e.target.value
                                        )
                                    }
                                    startContent={<IconUsers className='text-primary' size={20} />}
                                    classNames={{
                                        label: "!text-primary dark:!text-white text-sm md:text-md",
                                        inputWrapper: `hover:!bg-yellow-50 border ${validationErrors[field.question.replace(/\s+/g, '').toLowerCase()]
                                            ? 'border-danger'
                                            : ''
                                            }`,
                                        base: "dark:!text-neutralDark pt-4",
                                        input: "dark:!text-neutralDark",
                                    }}
                                />
                            )}

                            {/* Render RadioGroup Fields */}
                            {field.type === 'select' && field.question === 'Are you a Start-Up?' && (
                                <RadioGroup
                                    label={field.question}
                                    value={formValues['isStartup']}
                                    onChange={(e) => handleChange('isStartup', e.target.value)}
                                    orientation="horizontal"
                                    classNames={{
                                        label: "!text-primary dark:!text-white text-sm md:text-md",
                                    }}
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
                <Sidebar hints={content.hints} whyDoWeAsk={content.why_do_we_ask} />
            </div>
        </form>
    );
});

StepContactInfo.displayName = 'StepContactInfo';

export default StepContactInfo;
