const express = require('express')
const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const expressSession = require('express-session')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: 'hello'
}))

const user = { id: 'cse123', name: 'abhishek', password: 'aansh' }
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy({ usernameField: 'name', passwordField: 'password' }, async (name, password, done) => {
    if (name != user.name) return done(null, false, { mess: 'name not found in db' })
    if (password != user.password) return done(null, false, { mess: 'password is wrong' })
    return done(null, user)
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
    if (id == user.id) {
        done(null, user)
    }
    else {
        return done(null, false, { message: 'user not found' })
    }
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.json({ mess: 'server error' })
        if (!user) return res.json({ mes: info.mess })
        req.login(user, (err) => {
            if (err) return res.json({ mess: 'login failed', success: false })
            else {
                return res.json({ mess: 'login success', success: true })
            }
        })
    })(req, res, next)
})

app.get('/checkAuth', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user })
    }
    else {
        res.json({ authenticated: false, user: req.user })
    }
})
app.delete('/logout', (req, res, next) => {
      console.log("Current session data before destroy:", req.session);
        console.log("User before destroy:", req.user); 
  req.logout(err => {
    if (err) return next(err);

    // Destroy the session completely
    req.session.destroy(err => {
      if (err) return next(err);

      // Clear the cookie in the browser
      res.clearCookie('connect.sid');
      return res.json({ success: true, mess: 'Logged out successfully' });
    });
  });
    console.log(" session data after destroy:", req.session);
        console.log("User after destroy:", req.user); 
});


const PORT = 2030
app.get('/', (req, res) => {
  
    res.send('server is running')
})
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})