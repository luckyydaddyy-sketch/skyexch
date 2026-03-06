import React from 'react'
import ReactPaginate from 'react-paginate'

const Pagination = (props: any) => {
    const { handlePageClick, totalPages } = props
    return (
        <nav>
            <ReactPaginate
                breakLabel="..."
                nextLabel="›"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={totalPages}
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="pagination"
                activeClassName="active"
                previousLabel="‹"
            // renderOnZeroPageCount={null}
            />
        </nav>
    )
}

export default Pagination