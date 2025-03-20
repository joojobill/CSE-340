const pool = require("../database/")

/* ***********************************
* Get all classification data
* ************************************/
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")

}

/**************************************
 * get all inventory items and classificstion_name by classificstion_id
******************************************/
async function getInventoryByClassificationId(classificstion_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOINpublic.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classificstion_id]
        )
        return data.rows
    }   catch(error){
        console.error("getclassificationsbyid error" + error)
    }
}

module.exports = {getClassifications, getInventoryByClassificationId};













module.exports = {getClassifications}
