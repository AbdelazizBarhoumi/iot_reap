# Phase 6: Final Verification
$f = "d:\projects\iot_reap\internshipReport\chapters\chapter3.tex"
$c = [System.IO.File]::ReadAllText($f)

# Count table labels
$tableMatches = [regex]::Matches($c, '\\label\{tab:[^}]+\}')
Write-Output "=== TABLE LABELS ==="
Write-Output "Total table labels: $($tableMatches.Count)"
Write-Output ""
foreach ($m in $tableMatches) { Write-Output "  $($m.Value)" }

# Count figure labels
$figMatches = [regex]::Matches($c, '\\label\{fig:[^}]+\}')
Write-Output ""
Write-Output "=== FIGURE LABELS ==="
Write-Output "Total figure labels: $($figMatches.Count)"
Write-Output ""
foreach ($m in $figMatches) { Write-Output "  $($m.Value)" }

# Check for duplicate labels
$allLabels = @()
foreach ($m in $tableMatches) { $allLabels += $m.Value }
foreach ($m in $figMatches) { $allLabels += $m.Value }
$uniqueLabels = $allLabels | Select-Object -Unique
Write-Output ""
if ($allLabels.Count -eq $uniqueLabels.Count) {
    Write-Output "NO DUPLICATE LABELS - all $($allLabels.Count) labels are unique"
} else {
    Write-Output "DUPLICATE LABELS FOUND! Total: $($allLabels.Count), Unique: $($uniqueLabels.Count)"
    $groups = $allLabels | Group-Object | Where-Object { $_.Count -gt 1 }
    foreach ($g in $groups) { Write-Output "  DUPLICATE: $($g.Name) appears $($g.Count) times" }
}

# Check PNG files
Write-Output ""
Write-Output "=== PNG FILES IN assets/chapter3 ==="
$pngs = Get-ChildItem "d:\projects\iot_reap\internshipReport\assets\chapter3\*.png" | Sort-Object Name
foreach ($p in $pngs) { Write-Output "  $($p.Name) ($($p.Length) bytes)" }
Write-Output "Total PNG files: $($pngs.Count)"

# Check PlantUML files
Write-Output ""
Write-Output "=== PLANTUML FILES ==="
$pumls = Get-ChildItem "d:\projects\iot_reap\internshipReport\plantuml\*.puml" | Sort-Object Name
foreach ($p in $pumls) { Write-Output "  $($p.Name)" }
Write-Output "Total PlantUML files: $($pumls.Count)"

# Verify new use cases in general UC diagram
Write-Output ""
Write-Output "=== GENERAL USE CASE DIAGRAM ==="
$ucFile = "d:\projects\iot_reap\internshipReport\plantuml\iot-reap-general-use-case.puml"
$ucContent = [System.IO.File]::ReadAllText($ucFile)
$ucMatches = [regex]::Matches($ucContent, 'usecase "[^"]+" as UC_\w+')
Write-Output "Total use cases in general diagram: $($ucMatches.Count)"
foreach ($m in $ucMatches) { Write-Output "  $($m.Value)" }
