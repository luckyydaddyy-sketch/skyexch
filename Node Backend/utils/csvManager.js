async function csvManager({ controllerFunction, fieldMapping, fileName }, req, res) {
    if(!controllerFunction || !fieldMapping) {
        return res.end();
    }

    req.body.page = 1;
    req.body.limit = 20;

    res.writeHead(200, {
        "Content-Disposition": `attachment;filename=${fileName ? fileName : 'result'}.csv`,
        'Content-Type': 'text/csv'
    });

    let fields = Object.keys(fieldMapping);
    res.write(`${fields.join(',')}\n`)

    let records = [];
    do {
        records = await controllerFunction(req);
        if(records && records.results && records.results.length > 0) {
            records = records.results
            for(let i in records) {
                let row = '';
                for(let j in fields) {
                    row = row + (records[i][fieldMapping[fields[j]]] ? records[i][fieldMapping[fields[j]]] : '') + (j != fields.length - 1 ? ',' : '')
                }
                res.write(`${row}\n`)
            }
            req.body.page = req.body.page + 1;
        } else {
            records = [];
        }
    } while (records.length != 0);

    res.end();
}

module.exports = csvManager;