import React, { InputHTMLAttributes, LabelHTMLAttributes } from 'react'

type LabeledInputProps = {
    name: string;
    labelClassName?: string;
    inputClassName?: string;
    children: React.ReactNode;
    labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
};
function LabeledInput(
    {name = "", labelClassName = "", inputClassName = "", children, labelProps, inputProps}: LabeledInputProps
){
    return (
        <div className='flex items-center gap-5'>
            <label htmlFor={name} className={labelClassName} {...labelProps}>{children}</label>
            <input id={name} name={name} className={inputClassName} {...inputProps}></input>
        </div>
    );
}

export default LabeledInput