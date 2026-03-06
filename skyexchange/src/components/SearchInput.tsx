import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { styleObjectGetBG } from '../common/StyleSeter'

const SearchInput = (props: any) => {
    const DD = useSelector((e: any) => e.domainDetails);

    const [search, setSearch] = useState()

    const { searchSubmit, placeholder } = props

    const handleSearch = (e: any) => {
        const { value } = e.target
        setSearch(value)
        if (value === '') {
            searchSubmit(search)
        }
    }

    return (
        <div>
            <div className="search_box"><svg width="19" height="19" xmlns="http://www.w3.org/2000/svg"><path d="M12.547 11.543H12l-.205-.172a4.539 4.539 0 001.06-2.914A4.442 4.442 0 008.41 4C5.983 4 4 5.989 4 8.457a4.442 4.442 0 004.445 4.457c1.094 0 2.12-.411 2.905-1.062l.206.171v.548L14.974 16 16 14.971l-3.453-3.428zm-4.102 0a3.069 3.069 0 01-3.077-3.086 3.068 3.068 0 013.077-3.086 3.069 3.069 0 013.076 3.086 3.069 3.069 0 01-3.076 3.086z" fill="rgb(30,30,30"></path></svg>
                <input type="text" placeholder={placeholder ? placeholder : "Find Member..."} value={search} onChange={(e) => handleSearch(e)} />
                <button  style={styleObjectGetBG(DD?.colorSchema, false, true)} onClick={() => searchSubmit(search)}>Search</button>
            </div>
        </div>
    )
}

export default SearchInput