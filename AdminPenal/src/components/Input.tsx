

import React from 'react'

const Input = (props: any) => {
    const { label, placeholder, type, name, value, onChange, errorValidation, readOnly, maxLength, divClass } = props
    return<>
        <div className={divClass}>
        <span>{label}:</span>
        <span>
            <input type={type} placeholder={placeholder ? placeholder : ''} name={name} maxLength={maxLength} className="form-control" readOnly={readOnly} value={value} onChange={(e) => onChange(e)} />
        </span>
    </div>
        {errorValidation ? <> <br/> <span className="error" style={{ color: 'red' }} >{errorValidation}</span> </> : ""}
    </> 
}
export default Input