
import 'dotenv/config'


const  DB = () => ({
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT,
    dialect: "mysql",
  }
})

   try {
    if(DB)
     console.log("✅ MySQL connected successfully!"); 
   } catch (error) {
       
      console.log(error ,"Db Connection error");
      
   }
  
 
export default DB() ;