import { LabelHTMLAttributes, InputHTMLAttributes } from "react";

type InputRowProps = {
    name: string;
    labelClassName?: string;
    inputClassName?: string;
    children: React.ReactNode;
    labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
};
function InputRow({name = "", labelClassName = "", inputClassName = "", children, labelProps, inputProps}: InputRowProps){
    return(
        <tr>
            <th className='flex'><label htmlFor={name} className={`w-full h-full text-left ${labelClassName}`} {...labelProps}>{children}</label></th>
            <td className='pb-5 text-center w-fit'><input id={name} name={name} className={inputClassName} {...inputProps}></input></td>
        </tr>
    );
}

export default InputRow;