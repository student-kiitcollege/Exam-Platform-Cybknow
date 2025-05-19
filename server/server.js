const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const questionRoutes = require('./routes/questinRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();


app.use(cors());
app.use(express.json());

app.use('/api/questions', questionRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect('mongodb+srv://jenasourav2001:jenasourav2001@exam-platform.gb4qvrp.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected ✅'))
.catch(err => console.error('MongoDB connection error ❌:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
