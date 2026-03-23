const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://luckyydaddyy_db_user:4yZufemgOqKlnbPH@skyexch0.nfnrw4n.mongodb.net/sky?retryWrites=true&w=majority')
  .then(() => { console.log("SUCCESS"); process.exit(0); })
  .catch(err => { console.error("ERROR:", err.message); process.exit(1); });
