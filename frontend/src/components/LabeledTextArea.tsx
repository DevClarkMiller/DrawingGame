import React, { TextareaHTMLAttributes, LabelHTMLAttributes } from 'react'

type LabeledTextAreaProps = {
    name: string;
    labelClassName?: string;
    inputClassName?: string;
    children: React.ReactNode;
    labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
    textAreaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
};
function LabeledTextArea({name = "", labelClassName = "", inputClassName = "", children, labelProps, textAreaProps}: LabeledTextAreaProps) {
    return (
        <div className='flex items-center gap-5'>
            <label htmlFor={name} className={labelClassName} {...labelProps}>{children}</label>
            <textarea id={name} name={name} className={inputClassName} {...textAreaProps} />
        </div>
    );
}

export default LabeledTextArea
