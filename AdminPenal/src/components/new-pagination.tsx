import { useSelector } from "react-redux";
import { styleObjectBlackButton } from "../common/StyleSeter";
import { useEffect, useState } from "react";

function NewPagination(props: any) {
  const DD = useSelector((e: any) => e.domainDetails);
  const [currantPage, setCurrantPage] = useState<any>(1);
  const [pageArray, setPageArray] = useState<Number[]>([]);
  const { handlePageClick, totalPages } = props;
  const getPageNumberData = () => {
    const pageArray = [];
    if (totalPages === 1) {
      pageArray.push(1);
    } else if (totalPages > 1 && currantPage === 1) {
      for (let i = 1; i <= totalPages; i++) {
        pageArray.push(i);
        if (i === 5) {
          break;
        }
      }
    } else if (totalPages > 1 && currantPage !== 1) {
      for (let m = 2; m >= 0; m--) {
        if (currantPage - m > 0) {
          pageArray.push(currantPage - m);
        }
      }
      const nextForValue = pageArray.length === 2 ? 3 : 2;
      for (let k = 1; k <= nextForValue; k++) {
        if (currantPage + k <= totalPages) {
          pageArray.push(currantPage + k);
        }
      }
    }

    setPageArray(pageArray);
  };
  useEffect(() => {
    getPageNumberData();
    return () => {};
  }, [currantPage, totalPages, handlePageClick]);

  const changePages = (page: Number) => {
    setCurrantPage(page);
    handlePageClick(page);
  };
  return (
    <div>
      <ul id="pageNumberContent" className="pages">
        <li id="prev">
          <a
            href="javascript:void(0);"
            className="disable"
            style={{ pointerEvents: "none" }}
          >
            Prev
          </a>
        </li>
        <li id="pageNumber">
          {pageArray.map((pageNumber: any) => {
            return (
              <>
                <a
                  href="javascript:void(0);"
                  className={`${pageNumber === currantPage}` ? "" : "select"}
                  style={
                    pageNumber === currantPage
                      ? styleObjectBlackButton(DD?.colorSchema, true)
                      : {}
                  }
                  onClick={() => changePages(pageNumber)}
                >
                  {pageNumber}
                </a>
              </>
            );
          })}
        </li>
        <li id="next">
          <a
            href="javascript:void(0);"
            className="disable"
            style={{ pointerEvents: "none" }}
          >
            Next
          </a>
        </li>
        <input type="number" id="goToPageNumber_1" maxLength={6} size={4} />
        <a
          id="goPageBtn_1"
          style={styleObjectBlackButton(DD?.colorSchema, true)}
        >
          GO
        </a>
      </ul>
    </div>
  );
}
export default NewPagination;
