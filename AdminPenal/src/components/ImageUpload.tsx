import React, { useState } from 'react'
import { ADMIN_API } from '../common/common';
import { postApi } from '../service';

const ImageUpload = (props: any) => {

    const { label, filename, setFileName, name, topClass } = props
    const [file, setFile] = useState<any>({ name: '' })

    const submitFile = async (e: any = undefined) => {
        let inputName = e.target.name;
        let image = e.target.files[0]
        setFile(e.target.files[0])

        const data = new FormData()
        data.append('photos', image ? image : file)
        data.append('fileName', image ? image.name : file.name)

        const finalData = {
            api: ADMIN_API.SETTING.FILE_UPLOAD,
            value: data,
        }

        await postApi(finalData).then(function (response) {
            console.log(response)
            setFileName(response.data.data.path, inputName)

        }).catch(err => {
            debugger
            console.log(err);
            if (err.response.data.statusCode === 401) {

            }
        })

    }

    return (
        <div className={topClass ? topClass  : `mb-3 col-3`}>
            <div>
                <label className="form-label">{label ? label : 'Image'}</label>
                <div className="input-group custom-file-button">
                    <label className="input-group-text" htmlFor={name}>Choose File</label>
                    <input name={name} className="form-control form-control-lg" onChange={(e) => submitFile(e)} id={name} type="file" />
                </div>
                {filename && <a href={process.env.REACT_APP_BASE_POINT + filename} target="_blank">
                    <img className="mt-3" style={{ maxWidth: "300px" }} src={process.env.REACT_APP_BASE_POINT + filename} alt="Image" />
                </a>}
            </div>
        </div>
    )
}

export default ImageUpload