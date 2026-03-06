import React, { useEffect, useState } from "react";

const SportsFilter = (prop: any) => {
  const {
    sportDetails,
    setSportDetails,
    setactiveClassForsport,
    setTurnamentName,
  } = prop;
  const [activeClass, setactiveClass] = useState<string>("sortByTime");
  const [sportTourList, setSportTourList] = useState<string[]>([]);

  useEffect(() => {
    if (sportDetails?.res) {
      let newSportData = sportDetails?.res;
      console.log("sportDetails :new ols: ", newSportData);
      if (activeClass === "sortByTime") {
        newSportData = sportDetails?.res?.sort(
          (a: any, b: any) =>
            new Date(a.openDate).getTime() - new Date(b.openDate).getTime()
        );
      } else {
        // newSportData = sportDetails?.res?.sort(
        //   (a: any, b: any) => a.TurnamentId - b.TurnamentId
        // );
        if (sportTourList.length === 0) {
          const sportTour: string[] = [];
          if (sportDetails && sportDetails?.res?.length > 0) {
            sportDetails?.res?.forEach((element: any) => {
              // const dd = element.Turnament;
              if (!sportTour.includes(element.Turnament)) {
                sportTour.push(element.Turnament);
              }
            });
          }
          setTurnamentName(sportTour);
          setSportTourList(sportTour);
        }
      }
      console.log("sportDetails :new ols: lsy", newSportData);
      setSportDetails({ res: newSportData });
    }
    return () => {};
  }, [activeClass]);
  return (
    <>
      <div className="sorting-wrap">
        <ul id="viewType">
          <li
            id="sortByTime"
            className={activeClass === "sortByTime" ? "select" : ""}
            onClick={() => {
              setactiveClass("sortByTime");
              setactiveClassForsport("sortByTime");
            }} /*"MobileHighlightHandler.viewType(this)"*/
          >
            by Time
          </li>
          <li
            id="sortByCompetition"
            className={activeClass === "sortByCompetition" ? "select" : ""}
            onClick={() => {
              setactiveClass("sortByCompetition");
              setactiveClassForsport("sortByCompetition");
            }} /*"MobileHighlightHandler.viewType(this)"*/
          >
            by Competition
          </li>
        </ul>
      </div>
    </>
  );
};

export default SportsFilter;
