import { useFormContext } from "react-hook-form"
import { AnimatePresence, motion } from "framer-motion"
import { MdError } from "react-icons/md"
import { findInputError, isFormInvalid } from "../utils/errorUtils"
import { useEffect } from "react"

export const Input = ({label, type, id, validation}) => {
    const {
        register,
        formState: { errors },
    } = useFormContext()

    const inputError = findInputError(errors, id)
    const isRequiredError = inputError?.error?.type === "required";
    const isInvalid = isFormInvalid(inputError)

    return(
        <div cl>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type={type}
                step="any"
                {...register(id, validation)}
            />
            <AnimatePresence mode="wait" initial={false}>
                {!isRequiredError && isInvalid && (
                    <InputError
                        message={inputError.error.message}
                        key={inputError.error.message}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

const InputError = ({ message }) => {
    return (
        <motion.p
            className="input-error"
            {...framer_error}
        >
            <MdError />
                {message}
        </motion.p>
    )
}

const framer_error = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.2 },
  }