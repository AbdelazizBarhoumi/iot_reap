@echo off
echo ===================================================
echo   DTR Internship Report - LaTeX Recompilation
echo ===================================================
echo.
echo Step 1: Closing any open PDF viewers (wait 3 seconds)...
timeout /t 3 /nobreak >nul

echo Step 2: Cleaning auxiliary files...
del /f /q *.aux 2>nul
del /f /q *.out 2>nul
del /f /q *.toc 2>nul
del /f /q *.lof 2>nul
del /f /q *.lot 2>nul
del /f /q *.log 2>nul
del /f /q *.synctex.gz 2>nul
del /f /q *.fdb_latexmk 2>nul
del /f /q *.fls 2>nul
del /f /q chapters\*.aux 2>nul
echo    - Auxiliary files cleaned!

echo.
echo Step 3: First compilation pass...
pdflatex -interaction=nonstopmode main.tex >nul 2>&1
if errorlevel 1 (
    echo    [WARNING] First pass completed with warnings
) else (
    echo    - First pass completed successfully!
)

echo.
echo Step 4: Second compilation pass (for TOC and references)...
pdflatex -interaction=nonstopmode main.tex >nul 2>&1
if errorlevel 1 (
    echo    [WARNING] Second pass completed with warnings
) else (
    echo    - Second pass completed successfully!
)

echo.
echo ===================================================
echo   Compilation Complete!
echo ===================================================
echo.
echo Check main.pdf for:
echo   1. "Chapter X:" format in Table of Contents
echo   2. Dotted leaders (.....) connecting titles to page numbers
echo   3. All preliminary pages (Dedications, Abstract, etc.)
echo.
pause
