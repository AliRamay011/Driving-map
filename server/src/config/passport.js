console.log("🧭 Passport file executing...");
import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import models from "./db.js";
const { LocalUser } = models;

console.log("Running in:", process.env.NODE_ENV);
console.log("Callback URL:", process.env.GOOGLE_CALLBACK_URL);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://driving-map-backend.onrender.com"
          : "http://localhost:5000/api/google/callback",
    },

    // Passport.js mein yeh code theek karein
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile ID:", profile.id);

        let user = await LocalUser.findOne({ where: { googleId: profile.id } });

        if (!user) {
          console.log("User not found, creating new user...");
          user = await LocalUser.create({
            email: profile.emails[0].value,
            googleId: profile.id,
            name: profile.displayName, // ✅ Name save karein
            photoURL: profile.photos[0].value || null, // ✅ photo save karo
          });
          console.log("New user created:", user.toJSON());
        }

        return done(null, user); // ✅ User object pass karein
      } catch (err) {
        console.error("Error in Google strategy:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  const user = await LocalUser.findByPk(id);
  done(null, user);
});

export default passport;
