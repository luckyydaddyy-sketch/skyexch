import React, { useState } from "react";


const MultiMarketNoData = () => {

    return (
        <>
            <div id="noMultiMarkets" className="no-data" >
                <h3>There are currently no followed multi markets.
                </h3>
                <p>Please add some markets from events.
                </p>
            </div>
        </>
    );
};

export default MultiMarketNoData;
