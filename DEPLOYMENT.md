# 🚀 Fitness Tracker Deployment Guide

This guide covers multiple deployment options for your AI-powered fitness tracker application.

## 📋 Prerequisites

Before deploying, ensure you have:
- OpenAI API key
- Git repository pushed to GitHub
- Domain name (optional, for custom domains)

## 🌟 Recommended: Railway Deployment (Easiest)

Railway provides the simplest full-stack deployment experience.

### Steps:

1. **Connect Repository**
   ```bash
   # Push your code to GitHub (already done)
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select this repository
   - Railway will auto-detect both services

3. **Set Environment Variables**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   JWT_SECRET=generate-a-secure-random-string
   ENVIRONMENT=production
   ```

4. **Configure Domains**
   - Railway provides free subdomains
   - Add custom domain if needed

**Estimated Cost**: $5-20/month depending on usage

---

## 🎯 Alternative: Render Deployment

Great for FastAPI + React with generous free tier.

### Steps:

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Connect GitHub

2. **Deploy Backend**
   - Create new "Web Service"
   - Connect repository
   - Root directory: `Backend`
   - Build command: `pip install -r requirements.txt && pip install "bcrypt<4.0"`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Deploy Frontend**
   - Create new "Static Site"
   - Root directory: `Frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`

4. **Environment Variables**
   Backend:
   ```
   OPENAI_API_KEY=your_key_here
   JWT_SECRET=your_secret_here
   DATABASE_URL=sqlite:///./data.db
   ```
   
   Frontend:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

**Estimated Cost**: Free tier available, $7+/month for paid

---

## 🐳 Docker Deployment (Most Flexible)

Use Docker for any cloud provider or self-hosting.

### Local Testing:

```bash
# Set environment variables
cp .env.example .env
# Edit .env with your values

# Build and run
docker-compose up --build

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Deploy to any cloud:

1. **DigitalOcean App Platform**
   - Use docker-compose.yml
   - Add environment variables
   - $12+/month

2. **AWS ECS/Fargate**
   - Build images, push to ECR
   - Create ECS service
   - $20+/month

3. **Google Cloud Run**
   - Build and push images
   - Deploy containers
   - Pay per request

---

## ⚡ Vercel + PlanetScale (Modern Stack)

Perfect for scaling and performance.

### Frontend (Vercel):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd Frontend
vercel --prod
```

### Backend Options:
1. **Railway**: Deploy backend separately
2. **Vercel Functions**: Convert to serverless (requires refactoring)

### Database (PlanetScale):
- PostgreSQL-compatible
- Automatic scaling
- Branches for development

---

## 🔧 Production Configuration

### Environment Variables:

**Backend (.env)**:
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./data.db
JWT_SECRET=your-super-secure-random-string-here
ENVIRONMENT=production
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=secure-admin-password
```

**Frontend**:
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

### Security Checklist:
- ✅ Strong JWT secret (32+ characters)
- ✅ HTTPS enabled
- ✅ CORS properly configured
- ✅ Admin password changed
- ✅ OpenAI API key secured
- ✅ Database backups enabled

---

## 📊 Database Options

### Development/Small Scale:
- **SQLite**: Simple, file-based (current setup)
- Good for < 1000 users

### Production/Scale:
- **PostgreSQL**: Recommended for production
- **PlanetScale**: MySQL-compatible, serverless
- **Railway PostgreSQL**: Easy setup

### Migration to PostgreSQL:
```python
# Update DATABASE_URL
DATABASE_URL=postgresql://user:password@host:port/dbname

# Run migration
python Backend/production_db.py
```

---

## 🚨 Deployment Troubleshooting

### Common Issues:

1. **Build Failures**
   ```bash
   # Check Node version
   node --version  # Should be 16+
   
   # Clear cache
   npm cache clean --force
   ```

2. **Authentication Errors**
   ```bash
   # Verify environment variables
   echo $OPENAI_API_KEY
   
   # Check JWT secret
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **CORS Issues**
   - Update CORS origins in `Backend/main.py`
   - Add your frontend domain

4. **Database Connection**
   ```bash
   # Test database setup
   cd Backend
   python production_db.py
   ```

---

## 📈 Monitoring & Maintenance

### Health Checks:
- Backend: `GET /` endpoint
- Frontend: React app loads
- Database: User creation works

### Logging:
- Backend: FastAPI automatic logging
- Frontend: Browser console
- Deployment platform logs

### Backups:
- Database: Regular SQLite file backups
- Code: GitHub repository
- Environment: Document all variables

---

## 💰 Cost Estimates (Monthly)

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Railway | $5 credit | $5-20 | Full-stack simplicity |
| Render | Yes (limited) | $7-25 | Free start, easy scaling |
| Vercel + Railway | Vercel free | $5-15 | Modern JAMstack |
| DigitalOcean | No | $12-50 | Control & flexibility |
| AWS/GCP | Free tier | $10-100+ | Enterprise scale |

---

## 🎯 Quick Start (Railway - Recommended)

1. **Sign up**: [railway.app](https://railway.app)
2. **Connect GitHub**: Link this repository
3. **Deploy**: Railway auto-detects services
4. **Configure**: Add OPENAI_API_KEY
5. **Launch**: Get your URLs and test!

**Deployment time**: ~5 minutes ⚡

---

## 📞 Support

If you encounter issues:
1. Check deployment platform docs
2. Review environment variables
3. Test locally with production settings
4. Check platform-specific logs

**Happy deploying! 🚀**