const pool = require("../database/");
const bcrypt = require('bcryptjs');
const utilities = require('../utilities');

/* *****************************
*   Check for existing email
* *************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("checkExistingEmail error: " + error);
    throw error;
  }
}

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(account_password, 10);
    
    const sql = `
      INSERT INTO account (
        account_firstname, 
        account_lastname, 
        account_email, 
        account_password, 
        account_type
      ) VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *`;
    
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error("registerAccount error: " + error);
    throw error;
  }
}

module.exports = { registerAccount, checkExistingEmail };