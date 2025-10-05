const sql = require('mssql');

const config = {
    server: 'NICE', 
    database: 'charityevents_db',
    authentication: {
        type: 'ntlm', 
        options: {
            domain: process.env.USERDOMAIN, 
            userName: process.env.USERNAME, 
            password: '' 
        }
    },
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    port: 1433
};



const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ MSSQL Connected using Windows Authentication');
        return pool;
    })
    .catch(err => {
        console.error('❌ MSSQL Connection Failed:', err);
        throw err;
    });

module.exports = { sql, poolPromise };
