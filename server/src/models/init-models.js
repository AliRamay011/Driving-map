import _admins from './admins.js'
import _place_images  from './place_images.js'
import _places from './places.js'
import _users from './users.js';
import _Report from './report.js';
import _LocalUsers from './localusers.js';
import _otp from './otp.js';
import _session from './session.js';

const initModels = (sequelize) => {
  const admins = _admins(sequelize);
  var place_images = _place_images(sequelize);
  var places = _places(sequelize);
  var users = _users(sequelize);
  var report = _Report(sequelize)
  var LocalUser = _LocalUsers(sequelize)
  var otp = _otp(sequelize)
  var session = _session(sequelize)
  place_images.belongsTo(places, { as: "place", foreignKey: "place_id"});
  places.hasMany(place_images, { as: "place_images", foreignKey: "place_id"});

  return {
    admins,
    place_images,
    places,
    users,
    report ,
   LocalUser ,
   otp,
   session

  };
  
}
export default initModels;

