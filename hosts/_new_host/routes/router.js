var router = require('express').Router();

router.use((req, res, next)=>{
	next();
})



module.exports = router;
