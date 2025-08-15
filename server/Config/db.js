import MySql from 'mysql2';
import 'dotenv/config'

const  DbConnected =  MySql.createConnection({
    host: process.env.DB_HOSTNAME ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME

})

  DbConnected.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('✅ MySQL Connected!');
});
export default DbConnected ;