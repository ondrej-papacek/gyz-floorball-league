const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

require('./firebase');

const leagueRoutes = require('./routes/leagueRoutes');
const userRoutes = require('./routes/userRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const playoffRoutes = require('./routes/playoffRoutes');
const goalScorerRoutes = require('./routes/goalScorerRoutes');
const newsRoutes = require('./routes/newsRoutes');
const matchesRoutes = require('./routes/matchesRoutes');
const createUserRoute = require('./routes/createUser');
const errorHandler = require("./middleware/errorHandler");

app.use('/api/leagues', leagueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/playoff', playoffRoutes);
app.use('/api/goalScorers', goalScorerRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api', createUserRoute);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
