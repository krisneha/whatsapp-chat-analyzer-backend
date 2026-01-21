# 📊 WhatsApp Chat Analyzer

A MERN stack application to analyze WhatsApp group chat activity for the last 7 days.

## Features

- ✅ Upload WhatsApp exported `.txt` file
- ✅ Parse chat messages and extract user activity
- ✅ Display bar graph showing:
  - 🟦 Daily Active Users (users who sent messages)
  - 🟧 Daily New Users (users who joined that day)
- ✅ List users active on **at least 4 days** in the last 7 days

## Tech Stack

- **Backend**: Node.js, Express, Multer
- **Frontend**: React, Chart.js (react-chartjs-2), Axios
- **File Upload**: Multer (multipart/form-data)

## Project Structure

```
whatsapp-chat-analyzer/
├── backend/
│   ├── controllers/
│   │   └── chatController.js    # Parsing & analysis logic
│   ├── routes/
│   │   └── chatRoutes.js        # Upload endpoint
│   ├── uploads/                  # Uploaded files storage
│   ├── server.js                 # Express server
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js                # Main component
    │   ├── App.css               # Styles
    │   ├── index.js              # React entry point
    │   └── index.css
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React app:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## How to Use

1. **Export WhatsApp Chat**:
   - Open WhatsApp → Group Chat
   - Tap group name → More → Export Chat
   - Choose **Without Media**
   - Save the `.txt` file

2. **Upload & Analyze**:
   - Open `http://localhost:3000` in browser
   - Click "Choose File" and select your WhatsApp `.txt` file
   - Click "Upload & Analyze"
   - View the bar graph and power users list

## API Endpoint

**POST** `http://localhost:5000/api/chat/upload`

**Request**: `multipart/form-data` with field `chatFile` (file)

**Response**:
```json
{
  "message": "Analysis complete",
  "window": {
    "start": "2026-01-14",
    "end": "2026-01-20"
  },
  "dailyStats": [
    {
      "date": "2026-01-14",
      "activeUsers": 5,
      "newUsers": 2
    },
    ...
  ],
  "powerUsers": [
    {
      "user": "User Name",
      "activeDays": 5
    }
  ]
}
```

## Notes

- Make sure both backend (port 5000) and frontend (port 3000) are running
- Only `.txt` files are accepted
- Analysis covers the **last 7 calendar days** from today
- Power users are those active on **at least 4 different days** in the last 7 days
