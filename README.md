# LendConnect - Fintech Platform

LendConnect is a full-stack micro-lending platform that connects borrowers and lenders directly. It provides a secure, modern interface for applying, funding, and managing small loans, and includes role-based access for borrowers and lenders, transaction tracking, and in-app messaging. The project is built with a React frontend and a Node/Express backend backed by MongoDB, making it easy to extend and deploy.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with role-based access control
- **Dual Role System**: Users can be borrowers, lenders, or both
- **Loan Management**: Complete loan lifecycle from application to repayment
- **Real-time Messaging**: In-app communication between users
- **Transaction Tracking**: Comprehensive transaction history and reporting
- **Document Management**: Secure document upload and verification

### User Roles
- **Borrowers**: Apply for loans, track repayments, manage applications
- **Lenders**: Browse loan opportunities, manage investment portfolio
- **Both**: Full access to borrowing and lending features

### Trust & Security
- **User Verification**: Multi-level verification system
- **Credit Scoring**: Integrated credit assessment
- **Rating System**: Peer-to-peer rating and review system
- **Secure Transactions**: Bank-level security for all financial operations

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

## 📁 Project Structure

```
LendConnect/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── hooks/          # Custom React hooks
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Node.js backend API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LendConnect
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/lendconnect
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start MongoDB**
   ```bash
   mongod
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### User Endpoints
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile/:userId` - Update user profile
- `POST /api/users/change-password` - Change password
- `POST /api/users/upload-document` - Upload documents
- `GET /api/users/documents` - Get user documents

### Loan Endpoints
- `POST /api/loans` - Create loan request
- `GET /api/loans` - Get loans with filters
- `GET /api/loans/:id` - Get loan details
- `PUT /api/loans/:id` - Update loan
- `POST /api/loans/:id/fund` - Fund a loan
- `POST /api/loans/:id/approve` - Approve loan
- `POST /api/loans/:id/reject` - Reject loan

### Transaction Endpoints
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/:id` - Get transaction details
- `GET /api/transactions/balance` - Get user balance
- `POST /api/transactions/repay` - Create repayment

### Message Endpoints
- `GET /api/messages/threads` - Get message threads
- `POST /api/messages/threads` - Create message thread
- `GET /api/messages/threads/:threadId` - Get messages
- `POST /api/messages/threads/:threadId/messages` - Send message

## 🗄️ Database Schema

### Users Collection
- Personal information (name, email, phone, address)
- Role and verification status
- Financial information (credit score, income)
- Preferences and settings

### Loans Collection
- Basic loan information (title, description, amount)
- Financial details (interest rate, tenure, monthly payment)
- Status and funding progress
- Collateral information (for secured loans)
- Timeline and reviews

### Transactions Collection
- Transaction details (type, amount, status)
- Parties involved (from, to)
- Payment method and gateway information
- Audit trail and metadata

### Messages Collection
- Message content and metadata
- Thread management
- Read status and delivery tracking
- Attachments and actions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Input Validation**: Comprehensive input validation and sanitization
- **Role-based Access**: Granular permission system
- **File Upload Security**: Secure document handling
- **CORS Protection**: Cross-origin request security

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern Interface**: Clean, professional design
- **Loading States**: Smooth user experience
- **Error Handling**: Comprehensive error management
- **Form Validation**: Real-time form validation
- **Toast Notifications**: User feedback system

## 🚧 Development Status

### ✅ Completed Features
- [x] Project setup and structure
- [x] Backend API with Express.js
- [x] MongoDB database models
- [x] JWT authentication system
- [x] React frontend with Tailwind CSS
- [x] Landing page and authentication pages
- [x] User dashboards (Borrower & Lender)
- [x] Basic loan management interface
- [x] Transaction tracking
- [x] Messaging system UI
- [x] Profile management

### 🚧 In Progress
- [ ] Real-time messaging implementation
- [ ] File upload functionality
- [ ] Payment gateway integration
- [ ] Email notification system
- [ ] Advanced loan filtering and search

### 📋 Planned Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Automated loan approval system
- [ ] Credit score integration
- [ ] Multi-currency support
- [ ] API rate limiting
- [ ] Comprehensive testing suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@lendconnect.com or join our Slack channel.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS approach
- MongoDB team for the flexible database
- All contributors who help make this project better

---

**LendConnect** - Connecting borrowers and lenders for a better financial future.
