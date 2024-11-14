"use client";
import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
import { Input, Textarea } from "@nextui-org/input";
import { RadioGroup, Radio } from "@nextui-org/radio";
import { DateRangePicker } from "@nextui-org/date-picker";
import { Select, SelectItem } from "@nextui-org/select";
import { IconUser } from "@tabler/icons-react";

const HoverEffectInput = React.forwardRef(
  ({
    id,
    className,
    type = "text",
    label = "",
    required = false,
    options = [],
    triggerValidation = false,
    onValidationChange,
    validationBehavior = "native",
    validate: customValidation,
    onChange: parentOnChange,
    triggerBlur,
    parentValue,
    selectedKeys: parentSelectedKeys,
    ...props
  }, ref) => {
    const radius = 100;
    const [visible, setVisible] = useState(false);
    const disableEffect = useMemo(() => type === "radio", [type]);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const [value, setValue] = useState(parentValue || ""); // Use parentValue if it exists
    const [isTouched, setIsTouched] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Convert parentValue to array if it's a comma-separated string for multiselect
    const initialSelectedKeys = !parentValue ? parentSelectedKeys
      : type === "multiselect" && typeof parentValue === "string"
      ? parentValue.split(',').filter((key) => key) // Split by comma and remove empty strings
      : Array.isArray(parentValue) ? parentValue
      : [parentValue]; // Use parentValue directly if it's already an array

    const [selectedKeys, setSelectedKeys] = useState(initialSelectedKeys);

    const handleSelectionChange = (keys) => {
      // Check if new keys are different from current selectedKeys
      if (JSON.stringify(keys) !== JSON.stringify(selectedKeys)) {
        setSelectedKeys(keys); // Update selected keys
        if (parentOnChange) {
          // Send updated keys to parent component without duplicates
          parentOnChange({ target: { value: keys } });
        }
      }
    };

    useEffect(() => {
      // Trigger validation whenever form attempts to validate all fields
      if (triggerValidation) {
        validateInput(value);
      }
    }, [triggerValidation]);

    useEffect(() => {
      // Trigger blur whenever form attempts to validate all fields
      if (triggerBlur) {
        handleBlur();
      }
    }, [triggerBlur]);

    const handleBlur = () => {
      setIsTouched(true);
      validateInput(value);
    };

    const handleValidationChange = (isValid) => {
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    };

    const handleChange = (e) => {
      // Ensure newValue captures a string value directly
      const newValue = typeof e === 'string' ? e : e.target?.value;
      setValue(newValue);
      validateInput(newValue);
      setIsTouched(true);

      console.log("handleChange, newValue=", newValue);
      console.log("e=", e.target.value);

      // Pass the value directly to parentOnChange as a simple string
      if (parentOnChange) {
        parentOnChange(e);
      }
    };

    useEffect(() => {
      if (parentValue !== undefined) setValue(parentValue);  // Sync with parentValue on change
      console.log("parentValue change=", parentValue);
      console.log("type", typeof parentValue);
      console.log("value=", value);
    }, [parentValue]);

    const validateInput = (inputValue) => {
      let invalid = false;
      let errorMessage = "";

      if (required && !inputValue) {
        invalid = true;
        errorMessage = "This field is required";
      } else if (customValidation) {
        const validationResult = customValidation(inputValue);
        if (validationResult !== true) {
          invalid = true;
          errorMessage = validationResult.error;
        }
      } else {
        switch (type) {
          case "email":
            if (inputValue && !validateEmail(inputValue)) {
              invalid = true;
              errorMessage = "Please enter a valid email address";
            }
            break;
          case "tel":
            if (inputValue && !validateTel(inputValue)) {
              invalid = true;
              errorMessage = "Please enter a valid phone number";
            }
            break;
          case "url":
            if (inputValue && !validateURL(inputValue)) {
              invalid = true;
              errorMessage = "Please enter a valid URL";
            }
            break;
          case "dateRange":
            if (validateDateRange(inputValue)) {
              invalid = true;
              errorMessage = "Please provide a complete date range";
            }
            break;
          default:
            invalid = false;
        }
      }

      setIsInvalid(invalid);
      handleValidationChange(!invalid);

      setIsInvalid(invalid);
      setErrorMessage(errorMessage);
    };


    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const validateTel = (value) => /^\+?(\d.*){3,}$/.test(value);

    const validateDateRange = (value) => required && (!value || !value.startDate || !value.endDate);

    const validateURL = (url) => {
      const urlPattern = new RegExp(
        "^(https?:\\/\\/)?" + // Optional protocol
        "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" + // Domain name
        "localhost|" + // or localhost
        "\\d{1,3}(\\.\\d{1,3}){3})" + // or IPv4
        "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" + // Optional port and path
        "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + // Optional query string
        "(\\#[-a-zA-Z\\d_]*)?$", // Optional fragment
        "i"
      );
      return urlPattern.test(url);
    };


    return (
      <div className={type === "number" ? "w-1/2 m-auto" : ""}>
        {(type === "select" || type === "multiselect" || type === "dateRange" || type === "number") && <label className={"block my-4 text-foreground-600"}>{label} {required ? <span className="text-danger"> *</span> : ""}</label>}
        <motion.div
          style={{
            background: useMotionTemplate`
                    radial-gradient(
                        ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
                        var(--primary),
                        transparent 80%
                    )
                    `,
          }}
          onMouseMove={({ currentTarget, clientX, clientY }) => {
            const { left, top } = currentTarget.getBoundingClientRect();
            mouseX.set(clientX - left);
            mouseY.set(clientY - top);
          }}
          onMouseEnter={() => !disableEffect && setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          className="relative p-[2px] my-4 rounded-xl transition duration-300 group/input z-10"
        >
          {(type === "text" || type === "email" || type === "tel" || type === "textarea" || type === "url" || type === "number") && (
            <div className={cn(``, className)}>
              {type === "textarea" ? (
                <Textarea
                  id={id}
                  label={label}
                  isInvalid={isTouched && isInvalid}
                  color={isTouched && isInvalid ? "danger" : "default"} I
                  errorMessage={isTouched && isInvalid ? errorMessage : ""}
                  minRows={4}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  ref={ref}
                  validationBehavior={validationBehavior}
                  isRequired={required}
                  value={value}
                  validate={(inputValue) => {
                    if (customValidation) {
                      return customValidation(inputValue);
                    }
                    return required && !inputValue ? { valid: false, error: "This field is required" } : true;
                  }}
                  {...props}
                  classNames={{
                    label: "text-md text-primary",
                    inputWrapper: "bg-white hover:bg-white",
                    errorMessage: "absolute",
                    helperWrapper: "p-0"
                  }}
                />
              ) : (
                <Input
                  id={id}
                  type={type === 'url' ? 'text' : type}
                  label={type === 'number' ? `` : label}
                  isInvalid={isTouched && isInvalid}
                  color={isTouched && isInvalid ? "danger" : "default"}
                  classNames={{
                    errorMessage: "absolute",
                    helperWrapper: "p-0",
                    input: type === "number" ? "text-center" : "",
                  }}
                  startContent={type === "number" ? <IconUser className="w-5" /> : ""}
                  validationBehavior={validationBehavior}
                  value={value}
                  validate={(inputValue) => {
                    if (customValidation) {
                      return customValidation(inputValue);
                    }
                    if (required && !inputValue) {
                      return { valid: false, error: "This field is required" };
                    }
                    switch (type) {
                      case "email":
                        return validateEmail(inputValue) ? true : { valid: false, error: "Please enter a valid email address" };
                      case "tel":
                        return validateTel(inputValue) ? true : { valid: false, error: "Please enter a valid phone number" };
                      case "url":
                        return validateURL(inputValue) ? true : { valid: false, error: "Please enter a valid URL" };
                      default:
                        return true;
                    }
                  }}
                  errorMessage={isTouched && isInvalid ? errorMessage : ""}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  ref={ref}
                  isRequired={required} // Ensures accessibility hints
                  //value={value === "" || !value ? parentValue : value}
                  {...props}
                />

              )}
            </div>
          )}
          {(type === "select" || type === "multiselect") && (
            <div className={cn(``, className)}>
              <Select
                name="websiteGoal"
                aria-label={label}
                selectionMode={type === "multiselect" ? "multiple" : "single"}
                isInvalid={isTouched && isInvalid}
                validationBehavior={validationBehavior}
                value={value}
                validate={(inputValue) => {
                  if (customValidation) {
                    return customValidation(inputValue);
                  }
                  return required && !inputValue ? { valid: false, error: "This field is required" } : true;
                }}
                classNames={{
                  trigger: `px-4 py-2 border ${isInvalid ? "border-red-500" : "border-gray-300"} rounded-lg bg-white text-black hover:bg-gray-200`,
                  mainWrapper: "",
                  innerWrapper: "",
                  selectorIcon: "absolute right-4",
                  helperWrapper: "p-0",
                  base: "relative",
                }}
                onBlur={handleBlur}
                onChange={handleChange}
                ref={ref}
                placeholder="Select an option"
                isRequired={required}
                selectedKeys={selectedKeys}
                onSelectionChange={handleSelectionChange}
                {...props}
              >
                {options.map((option, index) => (
                  <SelectItem key={option.key || index} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
          {type === "radio" && (
            <div className={cn(``, className)}>
              <RadioGroup
                name="Website"
                label={label}
                isRequired={required}
                data-invalid={isInvalid}
                errorMessage={isTouched && isInvalid ? errorMessage : ""}
                validationBehavior={validationBehavior}
                value={value}
                validate={(inputValue) => {
                  if (customValidation) {
                    return customValidation(inputValue);
                  }
                  return required && !inputValue ? { valid: false, error: "This field is required" } : true;
                }}
                onBlur={handleBlur}
                onChange={handleChange}
                ref={ref}
                {...props}
              >
                {options.map((option, index) => (
                  <Radio key={option.key || index} value={option.name}>
                    {option.name}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          )}
          {type === "dateRange" && (
            <div className={cn(``, className)}>
              <DateRangePicker
                aria-label={label}
                isRequired={required}
                value={value}
                data-invalid={isInvalid}
                errorMessage={isTouched && isInvalid ? errorMessage : ""}
                onBlur={handleBlur}
                onChange={(newValue) => handleChange(newValue)}
                name={label.toLowerCase().replace(/\s/g, "-")}
                key={label}
                validate={(inputValue) => {
                  if (customValidation) {
                    return customValidation(inputValue);
                  }
                  return required && (!inputValue || !inputValue.startDate || !inputValue.endDate) ? { valid: false, error: "Please provide a complete date range" } : true;
                }}
                className="w-full"
              />
            </div>
          )}
        </motion.div>
      </div>
    );
  }
);

HoverEffectInput.displayName = "HoverEffectInput";

export { HoverEffectInput };
