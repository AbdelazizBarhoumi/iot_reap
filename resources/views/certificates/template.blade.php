<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Certificate of Completion</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #ffffff;
            width: 100%;
            height: 100%;
        }
        
        .certificate {
            width: 100%;
            height: 100vh;
            padding: 40px 60px;
            position: relative;
            overflow: hidden;
        }
        
        .border-frame {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid rgba(255, 215, 0, 0.6);
            border-radius: 8px;
        }
        
        .inner-border {
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 4px;
        }
        
        .content {
            position: relative;
            z-index: 10;
            text-align: center;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 40px 0;
        }
        
        .header {
            margin-bottom: 20px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #ffd700;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 42px;
            font-weight: 300;
            letter-spacing: 8px;
            text-transform: uppercase;
            color: #ffd700;
            margin-bottom: 5px;
        }
        
        .subtitle {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.7);
            letter-spacing: 4px;
            text-transform: uppercase;
        }
        
        .body {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .presented-to {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        
        .recipient-name {
            font-size: 48px;
            font-weight: 300;
            color: #ffffff;
            margin-bottom: 25px;
            font-style: italic;
        }
        
        .completion-text {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .trainingPath-name {
            font-size: 28px;
            font-weight: 600;
            color: #ffd700;
            margin-bottom: 10px;
        }
        
        .date {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 20px;
        }
        
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 40px;
        }
        
        .signature-block {
            text-align: center;
            width: 200px;
        }
        
        .signature-line {
            border-top: 1px solid rgba(255, 255, 255, 0.4);
            padding-top: 10px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
        }
        
        .instructor-name {
            font-size: 14px;
            color: #ffffff;
            margin-top: 5px;
        }
        
        .verification {
            text-align: center;
        }
        
        .verification-label {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .verification-code {
            font-size: 10px;
            font-family: 'Courier New', monospace;
            color: rgba(255, 255, 255, 0.7);
            word-break: break-all;
        }
        
        .decorative-element {
            position: absolute;
            width: 200px;
            height: 200px;
            border: 1px solid rgba(255, 215, 0, 0.1);
            border-radius: 50%;
        }
        
        .dec-1 {
            top: -100px;
            left: -100px;
        }
        
        .dec-2 {
            bottom: -100px;
            right: -100px;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="border-frame"></div>
        <div class="inner-border"></div>
        <div class="decorative-element dec-1"></div>
        <div class="decorative-element dec-2"></div>
        
        <div class="content">
            <div class="header">
                <div class="logo">IoT-REAP</div>
                <h1 class="title">Certificate</h1>
                <p class="subtitle">of Completion</p>
            </div>
            
            <div class="body">
                <p class="presented-to">This is to certify that</p>
                <h2 class="recipient-name">{{ $user->name }}</h2>
                <p class="completion-text">
                    has successfully completed the trainingPath
                </p>
                <h3 class="trainingPath-name">{{ $trainingPath->title }}</h3>
                <p class="date">
                    Issued on {{ $issuedAt->format('F j, Y') }}
                </p>
            </div>
            
            <div class="footer">
                <div class="signature-block">
                    <div class="signature-line">TrainingPath Instructor</div>
                    <div class="instructor-name">{{ $instructor->name }}</div>
                </div>
                
                <div class="verification">
                    <div class="verification-label">Certificate ID</div>
                    <div class="verification-code" style="margin-bottom: 5px;">{{ substr($certificate->hash, 0, 16) }}...</div>
                    <div class="verification-label">Verify at</div>
                    <div class="verification-code">{{ $verificationUrl }}</div>
                </div>
                
                <div class="signature-block">
                    <div class="signature-line">Platform</div>
                    <div class="instructor-name">IoT-REAP</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
