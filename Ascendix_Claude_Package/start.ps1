Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   Launching Ascendix Placement Preparation Portal" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. MongoDB
Write-Host "`n[1/4] Starting MongoDB Engine on port 27017..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd gateway; npm run mongo"

Start-Sleep -Seconds 3

# 2. Django
Write-Host "[2/4] Starting Django Domain Engine on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\python manage.py runserver 127.0.0.1:8000"

Start-Sleep -Seconds 2

# 3. Express Gateway
Write-Host "[3/4] Starting Express API Gateway on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd gateway; npm run dev"

Start-Sleep -Seconds 2

# 4. React Frontend
Write-Host "[4/4] Starting React Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host " All 4 services launched successfully!" -ForegroundColor Green
Write-Host " Open your browser at: http://localhost:3000" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
